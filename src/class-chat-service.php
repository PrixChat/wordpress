<?php

namespace PrixChat;

class Chat_Service {
    public function create_message( $data ) {
        $message            = $data['message'];
        $message['content'] = esc_html( trim( $message['content'] ) );

        if ( ! isset( $message['conversation_id'] ) ) {
            $message['conversation_id'] = $this->create_conversation( $data['url'] );
        }

        if ( isset( $message['reply_to'] ) && isset( $message['reply_to']['id'] ) ) {
            $message['reply_to_id']         = $message['reply_to']['id'];
            $message['reply_to']['content'] = esc_html( trim( $message['reply_to']['content'] ) );
            $message['reply_to']            = json_encode( $message['reply_to'] );
        }

        // Set typing to false for the current user
        Peer::update( [
            'is_typing'  => false,
            'deleted_at' => null,
        ], [
            'conversation_id' => $message['conversation_id'],
            'user_id'         => get_current_user_id(),
        ] );

        $message = Message::create( $message );

        return $message;
    }

    public function create_conversation( $hash ) {
        $my_id = get_current_user_id();

        if ( $hash[0] === '@' ) {
            $to_id = substr( $hash, 1 );
        }

        $hash = "{$my_id}-{$to_id}";
        if ( $my_id > $to_id ) {
            $hash = "{$to_id}-{$my_id}";
        }

        $data = [
            'type' => 'dm',
            'hash' => $hash,
        ];

        $conversation = Conversation::create( $data );

        // Add peers to relationship table
        $me = Peer::create( [
            'user_id'         => $my_id,
            'conversation_id' => $conversation['id'],
            'is_typing'       => false,
            'last_seen'       => wp_date( 'Y-m-d H:i:s' ),
        ] );

        $to = Peer::create( [
            'user_id'         => $to_id,
            'conversation_id' => $conversation['id'],
            'is_typing'       => false,
        ] );

        return $conversation['id'];
    }

    public function get_conversations( $args = [] ) {
        global $wpdb;

        $me            = wp_get_current_user();
        $conversations = [];
        $exclude       = [];

        $current_user_conversations_ids = Peer::get_conversation_ids();

        // Convert $current_user_conversations_ids to a comma separated string
        $current_user_conversations_ids = implode( ',', $current_user_conversations_ids );
        $prepare                        = [];

        if ( ! empty( $current_user_conversations_ids ) ) {
            $prepare[]     = $current_user_conversations_ids;
            $query         = "SELECT * FROM {$wpdb->prefix}prixchat_conversations WHERE id IN (%1s) AND deleted_at IS NULL";
            $query         = $wpdb->prepare( $query, $prepare );
            $conversations = $wpdb->get_results( $query );

            $messages_query = "SELECT * 
                FROM {$wpdb->prefix}prixchat_messages 
                WHERE id IN (
                    SELECT MAX(id) 
                    FROM {$wpdb->prefix}prixchat_messages 
                    WHERE conversation_id IN (%1s) 
                    AND (
                        deleted_at IS NULL
                        OR
                        deleted_for <> peer_id
                    )
                    GROUP BY conversation_id
                )
                ORDER BY created_at DESC";

            $messages_query = $wpdb->prepare( $messages_query, $prepare );
            $messages       = $wpdb->get_results( $messages_query );

            // Convert $messages key by conversation_id
            $messages = array_column( $messages, null, 'conversation_id' );

            // Get Peer data for each conversation
            $peers = Peer::get( [
                'in_conversation_id' => $current_user_conversations_ids,
            ] );

            // Format $peers, key by conversation_id
            $peers_by_conversation_id = [];

            foreach ( $peers as $peer ) {
                if ( ! isset( $peers_by_conversation_id[ $peer->conversation_id ] ) ) {
                    $peers_by_conversation_id[ $peer->conversation_id ] = [];
                }

                $peers_by_conversation_id[ $peer->conversation_id ][] = $peer;
            }

            $unread_count = Peer::get_unread_count( $me->ID );

            // Format conversations for display in the chat
            foreach ( $conversations as $id => $conversation ) {
                $conversation->messages = [];

                if ( isset( $messages[ $conversation->id ] ) ) {
                    $conversation->messages[] = $messages[ $conversation->id ];
                }

                $peers = $peers_by_conversation_id[ $conversation->id ];

                $last_message_sender = [];

                $recipient = [];

                if ( is_array( $peers ) && count( $peers ) > 0 ) {
                    foreach ( $peers as $peer ) {
                        if ( ! empty( $conversation->messages ) && $peer->id == $conversation->messages[0]->peer_id ) {
                            $last_message_sender = $peer;
                        }

                        if ( $peer->user_id != $me->ID ) {
                            $recipient = $peer;
                        }

                        if ( $conversation->type == 'dm' ) {
                            $exclude[] = $peer->user_id;
                        }
                    }

                    if ( empty( $recipient ) ) {
                        $recipient = $peer;
                    }
                }

                if ( isset( $last_message_sender ) && isset( $conversation->messages[0] ) ) {
                    $conversation->messages[0]->peer = $last_message_sender;
                }

                $conversation->url   = $conversation->id;
                $conversation->peers = $peers;
                $conversation->meta  = json_decode( $conversation->meta );

                if ( str_contains( 'group', $conversation->type ) && empty( $conversation->avatar ) && count( $conversation->peers ) > 1 ) {
                    $first_two_peers      = array_slice( $conversation->peers, 0, 2 );
                    $avatars              = array_column( $first_two_peers, 'avatar' );
                    $conversation->avatar = $avatars;
                }

                if ( ! empty( $recipient ) ) {
                    $conversation->recipient = $recipient;
                    $conversation->avatar    = $conversation->avatar ?? $recipient->avatar;
                    $conversation->title     = $conversation->title ?? $recipient->name;
                }

                $conversation->unread_count = $unread_count[ $conversation->id ] ?? 0;

                // Limit the size of $conversation->title
                $conversation->title  = substr( $conversation->title, 0, 20 );
                $conversations[ $id ] = $conversation;
            }
        }

        $exclude[] = $me->ID;
        
        // Users as empty conversations
        $users = Peer::get_all_users();

        foreach ( $users as $user ) {
            if ( ! in_array( $user['id'], $exclude ) ) {
                $conversations[] = [
                    'type'         => 'dm',
                    'title'        => $user['name'],
                    'avatar'       => $user['avatar'],
                    'url'          => '@' . $user['id'],
                    'unread_count' => 0,
                    'recipient'    => $user,
                    'messages'     => [],
                ];
            }
        }

        return $conversations;
    }
}
