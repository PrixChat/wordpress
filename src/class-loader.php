<?php

namespace PrixChat;

class Loader {
    public function __construct() {
        $this->load_files();

        $this->init_classes();
    }

    public function load_files() {
        $requires = [
            // Load helpers
            'helpers.php',
            
            // Load classes
            'class-admin.php',
            'class-broadcast-service.php',
            'class-cache-service.php',
            'class-chat-service.php',
            'class-conversation.php',
            'class-message.php',
            'class-migration.php',
            'class-peer.php',

            // Load controllers
            'controllers/class-base-controller.php',
            'controllers/class-conversations-controller.php',
            'controllers/class-peers-controller.php',
            'controllers/class-messages-controller.php',
            'controllers/class-sse-controller.php',
        ];

        foreach ( $requires as $require ) {
            require_once __DIR__ . '/' . $require;
        }
    }

    public function init_classes() {
        if ( is_admin() ) {
            new \PrixChat\Migration;
            new \PrixChat\Admin;
            new \PrixChat\Cache_Service;
        }

        new \PrixChat\Controllers\Conversations_Controller;
        new \PrixChat\Controllers\Peers_Controller;
        new \PrixChat\Controllers\Messages_Controller;
        new \PrixChat\Controllers\SSE_Controller;
    }
}
