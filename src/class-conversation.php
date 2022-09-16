<?php

namespace PrixChat;

class Conversation {
    private static function normalize( $conversation, $args ) {
        $my_id = get_current_user_id();

        if ( isset( $args['withs'] ) && is_array( $args['withs'] ) && in_array( 'peers', $args['withs'] ) ) {
            $peers = Peer::get( [
                'conversation_id' => $conversation->id,
            ] );

            $conversation->peers = $peers;

            // @todo: Check recipient if it's a DM conversation
            $recipient = [];
            foreach ( $conversation->peers as $id => $peer ) {
                if ( $peer->user_id != $my_id ) {
                    $recipient = $peer;
                }
            }

            if ( empty( $recipient ) ) {
                $recipient = $peer;
            }

            $conversation->recipient  = $recipient;
            $conversation->has_avatar = ! empty( $conversation->avatar );

            if ( strpos( $conversation->type, 'group' ) !== false && empty( $conversation->avatar ) && count( $conversation->peers ) > 1 ) {
                $first_two_peers      = array_slice( $conversation->peers, 0, 2 );
                $avatars              = array_column( $first_two_peers, 'avatar' );
                $conversation->avatar = $avatars;
            }

            $conversation->avatar = $conversation->avatar ?? $recipient->avatar;
            $conversation->title  = $conversation->title ?? $recipient->name;
            // Limit the size of $conversation->title
            $conversation->title = substr( $conversation->title, 0, 20 );
            $conversation->title = esc_html( $conversation->title );
        }

        $conversation->meta = json_decode( $conversation->meta, true );
        $conversation->url  = $conversation->id;

        return $conversation;
    }

    public static function find( $args ) {
        global $wpdb;

        $query = "SELECT * FROM {$wpdb->prefix}prixchat_conversations WHERE 1 = 1";

        $prepare = [];

        if ( isset( $args['id'] ) ) {
            $query     .= " AND id = %d";
            $prepare[] = $args['id'];
        }

        if ( isset( $args['hash'] ) ) {
            $query     .= " AND hash = %s";
            $prepare[] = $args['hash'];
        }

        $conversation = $wpdb->get_row( $wpdb->prepare( $query, $prepare ) );

        if ( ! $conversation ) {
            return [];
        }

        return self::normalize( $conversation, $args );
    }

    public static function create( $data ) {
        global $wpdb;

        $data = array_merge( $data, [
            'created_at' => current_time( 'mysql' ),
            'user_id'    => get_current_user_id(),
        ] );

        $wpdb->insert( $wpdb->prefix . 'prixchat_conversations', $data );

        return array_merge( $data, [
            'id' => $wpdb->insert_id,
        ] );
    }

    public static function update( $data, $where ) {
        global $wpdb;

        return $wpdb->update( $wpdb->prefix . 'prixchat_conversations', $data, $where );
    }

    public static function get( $args = [] ) {
        global $wpdb;

        $prepare = [];
        $query   = "SELECT * FROM {$wpdb->prefix}prixchat_conversations WHERE 1 = 1";

        if ( isset( $args['in'] ) ) {
            $query     .= " AND id IN (%1s)";
            $prepare[] = $args['in'];
        }

        $conversations = $wpdb->get_results( $wpdb->prepare( $query, $prepare ) );

        return array_map( function ( $conversation ) {
            return self::normalize( $conversation, [] );
        }, $conversations );
    }
}
