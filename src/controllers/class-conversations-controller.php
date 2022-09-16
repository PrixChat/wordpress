<?php

namespace PrixChat\Controllers;

use PrixChat\Chat_Service;
use PrixChat\Conversation;
use PrixChat\Message;
use PrixChat\Peer;

class Conversations_Controller extends Base_Controller {
	public function register_routes() {
		parent::register_routes();

		register_rest_route( $this->namespace, '/conversations/(?P<id>[\d]+)/typing', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'set_typing' ],
			'permission_callback' => '__return_true',
		] );
	}

	public function get_items( $request ) {
		$chat_service  = new Chat_Service();
		$conversations = $chat_service->get_conversations();

		return new \WP_REST_Response( $conversations, 200 );
	}

	public function get_item( $request ) {
		$params = $request->get_params();
		$params = $this->get_search_params( $params['id'] );

		$find_params = array_merge( $params, [
			'withs' => [ 'peers' ]
		] );

		$conversation = Conversation::find( $find_params );

		return new \WP_REST_Response( $conversation, 200 );
	}

	public function create_item( $request ) {
		$data  = $request->get_params();
		$files = $request->get_file_params();

		if ( ! isset( $data['title'] ) ) {
			return new \WP_REST_Response( [
				'message' => __( 'Title is required', 'prixchat' ),
			], 400 );
		}

		$conversation = [
			'type'  => 'group',
			'title' => $data['title'],
		];

		if ( ! empty( $files ) && ! empty( $files['avatar']['tmp_name'] ) ) {
			require_once( ABSPATH . 'wp-admin/includes/image.php' );
			require_once( ABSPATH . 'wp-admin/includes/file.php' );
			require_once( ABSPATH . 'wp-admin/includes/media.php' );

			$mimes = array(
				'bmp'  => 'image/bmp',
				'gif'  => 'image/gif',
				'jpe'  => 'image/jpeg',
				'jpeg' => 'image/jpeg',
				'jpg'  => 'image/jpeg',
				'png'  => 'image/png',
				'tif'  => 'image/tiff',
				'tiff' => 'image/tiff'
			);

			$overrides = array(
				'mimes'     => $mimes,
				'test_form' => false
			);

			$uploaded = wp_handle_upload( $files['avatar'], $overrides );
			// Uploaded format
			// {file: File Path, url: URL, type: "image/jpeg"}
			$conversation['avatar'] = $uploaded['url'];
		}

		$conversation = Conversation::create( $conversation );

		// Add current user to the conversation as the first user
		Peer::create( [
			'conversation_id' => $conversation['id'],
			'user_id'         => get_current_user_id(),
		] );

		return new \WP_REST_Response( $conversation, 201 );
	}

	/**
	 * Instead of delete from database, we just let peer leave the conversation
	 */
	public function delete_item( $request ) {
		global $wpdb;
		$data    = $request->get_params();
		$user_id = get_current_user_id();

		$peer = Peer::get( [
			'user_id'         => $user_id,
			'conversation_id' => $data['id'],
		] );

		if ( ! $peer ) {
			return new \WP_REST_Response( [
				'message' => __( 'You are not a member of this conversation', 'prixchat' ),
			], 403 );
		}

		$peer = reset( $peer );

		$wpdb->update( $wpdb->prefix . 'prixchat_peers', [
			'deleted_at' => wp_date( 'Y-m-d H:i:s' ),
		], [
			'id' => $peer->id,
		] );

		return new \WP_REST_Response( [
			'status' => 'ok',
		], 200 );
	}

	private function get_search_params( $url ) {
		if ( $url[0] === 'g' ) {
			return [
				'hash' => $url
			];
		}

		if ( $url[0] === '@' ) {
			$hash_id = intval( substr( $url, 1 ) );

			$current_user_id = get_current_user_id();
			$target_id       = $hash_id;

			$hash = "{$current_user_id}-{$target_id}";

			if ( $current_user_id > $target_id ) {
				$hash = "{$target_id}-{$current_user_id}";
			}

			return compact( 'hash' );
		}

		return [
			'id' => $url
		];
	}

	public function set_typing( $request ) {
		$data = $request->get_params();

		$conversation = Conversation::find( [
			'id' => $data['id'],
		] );

		if ( ! $conversation ) {
			return new \WP_REST_Response( [
				'message' => __( 'Conversation not found', 'prixchat' ),
			], 404 );
		}

		$typing = $data['typing'];

		Peer::update( [
			'is_typing' => (bool) $typing,
		], [
			'conversation_id' => $conversation->id,
			'user_id'         => get_current_user_id(),
		] );

		return new \WP_REST_Response( [
			'status' => 'ok',
		], 200 );
	}

	public function update_item($request)
	{
		$data  = $request->get_params();
		$files = $request->get_file_params();

		if ( ! isset( $data['title'] ) ) {
			return new \WP_REST_Response( [
				'message' => __( 'Title is required', 'prixchat' ),
			], 400 );
		}

		$update = [
			'title' => $data['title'],
		];
		
		if ( ! empty( $files ) && ! empty( $files['avatar']['tmp_name'] ) ) {
			require_once( ABSPATH . 'wp-admin/includes/image.php' );
			require_once( ABSPATH . 'wp-admin/includes/file.php' );
			require_once( ABSPATH . 'wp-admin/includes/media.php' );

			$mimes = array(
				'bmp'  => 'image/bmp',
				'gif'  => 'image/gif',
				'jpe'  => 'image/jpeg',
				'jpeg' => 'image/jpeg',
				'jpg'  => 'image/jpeg',
				'png'  => 'image/png',
				'tif'  => 'image/tiff',
				'tiff' => 'image/tiff'
			);

			$overrides = array(
				'mimes'     => $mimes,
				'test_form' => false
			);

			$uploaded = wp_handle_upload( $files['avatar'], $overrides );

			if (isset($uploaded['url'])) {
				$update['avatar'] = $uploaded['url'];
			}
		}

		Conversation::update($update, [
			'id' => $data['id'],
		]);

		$conversation = Conversation::find([
			'id' => $data['id'],
		]);
		
		return new \WP_REST_Response( $conversation, 200 );
	}
}
