<?php

namespace PrixChat;

class Message {
    public static function create( $data ) {
        global $wpdb;

        $peers = Peer::get( [
            'user_id'         => get_current_user_id(),
            'conversation_id' => $data['conversation_id'],
        ] );

        if ( ! $peers ) {
            return [];
        }

        $peer = reset( $peers );

        $data = [
            'type'            => $data['type'],
            'conversation_id' => $data['conversation_id'],
            'peer_id'         => $peer->id,
            'user_id'         => get_current_user_id(),
            'content'         => $data['content'],
            'created_at'      => current_time( 'mysql' ),
            'reply_to'        => $data['reply_to'] ?? null,
            'reply_to_id'     => $data['reply_to_id'] ?? null,
        ];

        $wpdb->insert( $wpdb->prefix . 'prixchat_messages', $data );

        return array_merge( $data, [
            'id' => $wpdb->insert_id,
        ] );
    }

    public static function find( $args = [] ) {
        global $wpdb;

        if ( isset( $args['id'] ) ) {
            $args['id'] = intval( $args['id'] );

            $sql     = "SELECT * FROM {$wpdb->prefix}prixchat_messages WHERE id = %d";
            $sql     = $wpdb->prepare( $sql, $args['id'] );
            $message = $wpdb->get_row( $sql );

            return $message;
        }
    }

    public static function get( $args = [] ) {
        global $wpdb;

        if ( ! isset( $args['conversation_id'] ) ) {
            return [];
        }

        // Get conversation
        $conversation = Conversation::find( [
            'id'    => $args['conversation_id'],
            'withs' => [ 'peers' ]
        ] );


        $me_inside = false;
        $me_peer   = null;

        if ( ! $conversation ) {
            return [];
        }
        
        foreach ( $conversation->peers as $peer ) {
            if ( $peer->user_id == get_current_user_id() ) {
                $me_peer   = $peer;
                $me_inside = true;
                break;
            }
        }

        if ( ! $me_inside ) {
            return [];
        }

        $prepare = [];
        $query   = "SELECT * FROM {$wpdb->prefix}prixchat_messages WHERE conversation_id = %d AND (deleted_at IS NULL OR deleted_for <> peer_id)";

        $prepare[] = $args['conversation_id'];

        if ( $me_peer && $me_peer->deleted_at ) {
            $query     .= " AND created_at > %s";
            $prepare[] = $me_peer->deleted_at;
        }

        if ( isset( $args['after'] ) ) {
            $query     .= " AND id > %d";
            $prepare[] = $args['after'];
        }

        if ( isset( $args['before'] ) ) {
            $query     .= " AND id < %d";
            $prepare[] = $args['before'];
        }

        $query .= " ORDER BY id DESC LIMIT 20";

        $messages = $wpdb->get_results( $wpdb->prepare( $query, $prepare ) );

        // Format messages for display in the chat
        $messages = array_map( function ( $message ) use ( $conversation ) {
            return self::normalize( $message, $conversation );
        }, $messages );

        return $messages;
    }

    public static function normalize( $message, $conversation ) {
        $peers = $conversation->peers;

        $message->conversation = $conversation;
        $message->content      = nl2br( $message->content );
        $message->reactions    = $message->reactions ? json_decode( $message->reactions, true ) : [];

        if ( ! empty( $message->reactions ) ) {
            $message->reactions = array_map( function ( $reaction ) use ( $peers ) {
                return array_map( function ( $peer ) use ( $peers ) {
                    $peer['peer'] = $peers[ $peer['peer_id'] ] ?? [];

                    return $peer;
                }, $reaction );
            }, $message->reactions );
        }

        if ( $message->reply_to ) {
            $message->reply_to = json_decode( $message->reply_to );
        }

        $message->peer = $peers[ $message->peer_id ] ?? [];

        return $message;
    }
}
