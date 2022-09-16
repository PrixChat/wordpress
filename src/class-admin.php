<?php

namespace PrixChat;

class Admin {
    public function __construct() {
        // Register admin page
        add_action( 'admin_menu', [ $this, 'add_admin_page' ] );

        // Register admin page scripts
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ] );
    }

    public function add_admin_page() {
        add_menu_page(
            __( 'PrixChat', 'prixchat' ),
            __( 'PrixChat', 'prixchat' ),
            'read',
            'prixchat',
            [ $this, 'render_admin_page' ],
            'dashicons-format-chat',
            3
        );
    }

    public function enqueue_admin_scripts() {
        if ( get_current_screen()->id !== 'toplevel_page_prixchat' ) {
            return;
        }

        wp_enqueue_style( 'prixchat-admin', PRIXCHAT_URL . '/react-ui/dist/index.css' );
        wp_enqueue_script( 'prixchat-admin', PRIXCHAT_URL . '/react-ui/dist/index.js', [ 'wp-i18n' ], '1.0.0', true );
        wp_set_script_translations( 'prixchat-admin', 'prixchat' );

        $chat_service = new Chat_Service();
        // Retrieve all users and pass them to scripts
        $conversations = $chat_service->get_conversations();
        $current_user  = wp_get_current_user();

        $me = [
            'id'     => $current_user->ID,
            'name'   => $current_user->display_name,
            'email'  => $current_user->user_email,
            'avatar' => get_avatar_url( $current_user->ID ),
        ];

        $users = Peer::get_all_users();

        // Although we are using wp_set_script_translations for i18n, it's useful to use wp_localize_script
        // to pass data to the React app.
        wp_localize_script( 'prixchat-admin', 'prix', [
            'apiUrl'        => home_url( '/wp-json/prixchat/v1/' ),
            'nonce'         => wp_create_nonce( 'wp_rest' ),
            'conversations' => $conversations,
            'me'            => $me,
            'users'         => $users,
        ] );
    }

    public function render_admin_page() {
        ?>
        <div class="wrap">
            <div id="pc-root"></div>
        </div>
        <?php
    }
}
