<?php
/*
Plugin Name: PrixChat
Plugin URI: https://prixchat.com/
Description: Realtime, effective chat solution for WordPress
Version: 1.0.0
Author: PrixChat
License: GPLv2 or later
Text Domain: prixchat
Domain Path: /languages
*/

// Prevent loading this file directly
if ( ! defined( 'ABSPATH' ) ) {
    wp_die( __( 'Please do not load this file directly. Thanks!', 'prixchat' ) );
}

// This plugin require PHP > 7.0
if ( version_compare( PHP_VERSION, '7.0.0', '<' ) ) {
    wp_die( __( 'I need at least PHP 7.0 to run properly!', 'prixchat' ) );
}

define( 'PRIXCHAT_DIR', __DIR__ );
define( 'PRIXCHAT_URL', plugins_url( '', __FILE__ ) );

require_once __DIR__ . '/src/class-loader.php';
new PrixChat\Loader;

function prixchat_uninstall_cronjobs() {
    wp_clear_scheduled_hook( 'prixchat_clear_cache' );
}

// Clean up after deactivation
register_deactivation_hook( __FILE__, 'prixchat_uninstall_cronjobs' );
