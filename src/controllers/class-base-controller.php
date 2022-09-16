<?php

namespace PrixChat\Controllers;

use WP_REST_Controller;

class Base_Controller extends WP_REST_Controller {
    protected $namespace = 'prixchat/v1';

    protected $rest_base = '';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        $rest_base = $this->get_rest_base();

        register_rest_route( $this->namespace, '/' . $rest_base, [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_items' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $this->namespace, '/' . $rest_base, [
            'methods'             => 'POST',
            'callback'            => [ $this, 'create_item' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $this->namespace, '/' . $rest_base . '/bulk', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'create_items' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $this->namespace, '/' . $rest_base . '/(?P<id>[\s\S]+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_item' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $this->namespace, '/' . $rest_base . '/(?P<id>[\d]+)', [
            'methods'             => [ 'PUT', 'POST' ],
            'callback'            => [ $this, 'update_item' ],
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $this->namespace, '/' . $rest_base . '/(?P<id>[\d]+)', [
            'methods'             => 'DELETE',
            'callback'            => [ $this, 'delete_item' ],
            'permission_callback' => '__return_true',
        ] );
    }

    private function get_rest_base() {
        $class_name = get_class( $this );
        $class_name = explode( '\\', $class_name );
        $class_name = end( $class_name );
        $class_name = str_replace( '_', '-', $class_name );
        $class_name = strtolower( $class_name );
        $class_name = str_replace( '-controller', '', $class_name );

        return $class_name;
    }
}
