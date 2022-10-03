<?php

namespace PrixChat;

class Admin {
    public function __construct() {
        // Register admin page
        add_action( 'admin_menu', [ $this, 'add_admin_page' ] );

        // Register admin page scripts
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ] );

        // Admin page action handler
        add_action( 'admin_init', [ $this, 'handle_admin_actions' ] );
    }

    public function add_admin_page() {
        $allowed_roles = prixchat_get_settings('roles');
        if (is_string($allowed_roles) && $allowed_roles === 'all') {
            $capability = 'read';
        } else {
            $capability = 'use_prixchat';
        }

        add_menu_page(
            __( 'PrixChat', 'prixchat' ),
            __( 'PrixChat', 'prixchat' ),
            $capability,
            'prixchat',
            [ $this, 'render_admin_page' ],
            'dashicons-format-chat',
            3
        );

        // Add sub menu page
        add_submenu_page(
            'prixchat',
            __( 'Settings', 'prixchat' ),
            __( 'Settings', 'prixchat' ),
            'manage_options',
            'prixchat-settings',
            [ $this, 'render_settings_page' ]
        );
    }

    public function enqueue_admin_scripts() {
        if ( get_current_screen()->id !== 'toplevel_page_prixchat' && get_current_screen()->id !== 'prixchat_page_prixchat-settings' ) {
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
            <div id="pc-root">
                <App />
            </div>
        </div>
        <?php
    }

    public function handle_admin_actions()
    {
        if ( ! isset( $_POST['prixchat'] ) ) {
            return;
        }

        if ( ! wp_verify_nonce( $_POST['prixchat'], 'prixchat' ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        if ( isset( $_POST['prixchat'] ) ) {
            $settings = [];
            
            $settings['emojis'] = isset($_POST['emojis']) ? sanitize_text_field($_POST['emojis']) : '';
            $settings['incoming_messages_sound'] = isset($_POST['incoming_messages_sound']) ? sanitize_text_field($_POST['incoming_messages_sound']) : '';
            $settings['roles'] = isset($_POST['roles']) ? serialize($_POST['roles']) : 'all';

            // Update capabilities
            if (is_array($_POST['roles']) && $_POST['roles'] !== 'all') {
                $all_roles  = wp_roles()->roles;
                $all_roles  = array_keys($all_roles);

                foreach ($all_roles as $role) {
                    $role = get_role($role);

                    if (in_array($role->name, $_POST['roles'])) {
                        $role->add_cap('use_prixchat');
                    } else {
                        $role->remove_cap('use_prixchat');
                    }
                }
            }

            update_option( 'prixchat_settings', $settings );
        }
    }

    public function render_settings_page() {
        require_once PRIXCHAT_DIR . '/partials/settings.php';
    }
}
