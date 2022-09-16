<?php

namespace PrixChat;

class Broadcast_Service {
    protected $after;

    public $request;

    public $chat_service;

    protected $conversations;

    public function __construct() {
        $this->chat_service = new Chat_Service();
    }

    public function send() {
        $params          = $this->request->get_params();
        $conversation_id = $params['conversation_id'];

        if ( ! is_numeric( $conversation_id ) ) {
            exit;
        }

        $response = [];

        $peers = Peer::get( [
            'conversation_id' => $conversation_id,
        ] );

        if ( $peers ) {
            $response['peers'] = $peers;
        }

        $me_in = false;
        foreach ( $peers as $peer ) {
            if ( $peer->user_id == get_current_user_id() ) {
                $me_in = true;
            }
        }

        if ( ! $me_in ) {
            $this->send_ping();

            return;
        }

        $messages = Message::get( [
            'conversation_id' => $this->request->get_param( 'conversation_id' ),
        ] );

        // Add seens to messages
        if ( $messages ) {
            foreach ( $messages as $index => $message ) {
                $message->seens = [];
                $added          = [];
                foreach ( $peers as $id => $peer ) {
                    if ( $peer->last_seen >= $message->created_at ) {
                        if ( ! in_array( $peer->id, $added ) ) {
                            $message->seens[] = $peer;
                            $added[]          = $id;
                        }

                        unset( $peers[ $id ] );
                    }
                }

                $messages[ $index ] = $message;
            }

            $messages = array_reverse( $messages );

            $response['messages'] = $messages;
        }

        Peer::set_last_seen( $conversation_id );

        $second = date( 's' );

        // Fetch new conversations every 3 seconds to reduce server load
        if ( $second % 3 === 0 ) {
            $conversations = $this->chat_service->get_conversations();
            if ( $conversations ) {
                $response['conversations'] = $conversations;
            }
        }

        if ( ! empty( $response ) ) {
            $this->send_data( $response );

            return;
        }

        $this->send_ping();
    }

    private function send_data( $data ) {
        $escaped_data = prixchat_escape( $data );
        $json = wp_json_encode( $escaped_data );
        echo "data: {$json}\n\n";

        ob_flush();
        flush();
    }

    private function send_ping() {
        echo "data: ping\n\n";
        ob_flush();
        flush();
    }

    public function start() {
        // Enable cors
        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Credentials: true');

        // Start broadcasting SSE
        header( 'Content-Type: text/event-stream; charset=utf-8' );
        header( 'Cache-Control: no-cache' );
        header( 'Connection: keep-alive' );
        header( 'X-Accel-Buffering: no' );

        while ( true ) {
            // Send data to client
            $this->send();

            // Wait 1 second for the next message / event
            sleep( 1 );

            // Stop broadcasting SSE if the client is not connected
            if ( connection_status() !== CONNECTION_NORMAL ) {
                exit;
            }
        }
    }
}
