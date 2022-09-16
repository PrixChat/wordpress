<?php
/**
 * Make sure we leave nothing when uninstall
 */
if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

global $wpdb;

$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'prixchat_conversations' );
$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'prixchat_messages' );
$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'prixchat_peers' );

delete_option( 'prixchat_db_version' );