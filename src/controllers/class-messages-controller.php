<?php

namespace PrixChat\Controllers;

use PrixChat\Chat_Service;
use PrixChat\Message;
use PrixChat\Peer;

class Messages_Controller extends Base_Controller {
    public function register_routes() {
        parent::register_routes();

        register_rest_route( $this->namespace, '/messages/(?P<id>[\d]+)/reactions', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'toggle_reaction' ],
            'permission_callback' => '__return_true',
        ] );
    }

    public function get_items( $request ) {
        $messages = Message::get( [
            'before'          => $request->get_param( 'before' ),
            'conversation_id' => $request->get_param( 'conversation_id' ),
        ] );

        $messages = array_reverse( $messages );
        $messages = prixchat_escape( $messages );

        return new \WP_REST_Response( $messages, 200 );
    }

    public function delete_item( $request ) {
        global $wpdb;

        $data = $request->get_params();

        if ( ! isset( $data['id'] ) ) {
            return new \WP_REST_Response( [
                'message' => __( 'Message id is required', 'prixchat' ),
            ], 400 );
        }

        $delete_for_every_one = $data['delete_for_everyone'] ?? false;

        $user_id = get_current_user_id();

        $message = Message::find( [
            'id' => $data['id'],
        ] );

        if ( ! $message ) {
            return new \WP_REST_Response( [
                'message' => __( 'Message not found', 'prixchat' ),
            ], 404 );
        }

        if ( $message->user_id != $user_id ) {
            return new \WP_REST_Response( [
                'message' => __( 'You can not delete this message', 'prixchat' ),
            ], 403 );
        }

        $where = [
            'id' => $data['id'],
        ];

        if ( $delete_for_every_one == true ) {
            $wpdb->delete( $wpdb->prefix . 'prixchat_messages', $where );
        } else {
            $wpdb->update( $wpdb->prefix . 'prixchat_messages', [
                'deleted_at'  => wp_date( 'Y-m-d H:i:s' ),
                'deleted_for' => $message->peer_id,
            ], $where );
        }

        return new \WP_REST_Response( [
            'status' => 'ok',
        ], 200 );
    }

    public function create_item( $request ) {
        $data         = $request->get_params();
        $chat_service = new Chat_Service;

        $message = $chat_service->create_message( $data );
        $message = prixchat_escape( $message );

        return new \WP_REST_Response( $message, 200 );
    }

    public function toggle_reaction( $request ) {
        global $wpdb;

        $data = $request->get_params();

        if ( ! isset( $data['id'] ) ) {
            return new \WP_REST_Response( [
                'message' => __( 'Message id is required', 'prixchat' ),
            ], 400 );
        }

        $message = Message::find( [
            'id' => $data['id'],
        ] );

        if ( ! $message ) {
            return new \WP_REST_Response( [
                'message' => __( 'Message not found', 'prixchat' ),
            ], 404 );
        }

        $peer = Peer::get( [
            'user_id'         => get_current_user_id(),
            'conversation_id' => $message->conversation_id,
        ] );

        $peer = reset( $peer );

        $reaction = trim( $data['reaction'] );

        $reactions = json_decode( $message->reactions, true );

        if ( ! isset( $reactions[ $reaction ] ) ) {
            $reactions[ $reaction ] = [];
        }

        $reactions[ $reaction ][] = [
            'peer_id'    => $peer->id,
            'reacted_at' => wp_date( 'Y-m-d H:i:s' ),
        ];

        $reactions = json_encode( $reactions );

        $wpdb->update( $wpdb->prefix . 'prixchat_messages', [
            'reactions' => $reactions,
        ], [
            'id' => $message->id,
        ] );

        return new \WP_REST_Response( [
            'status' => 'ok',
        ], 200 );
    }
}
