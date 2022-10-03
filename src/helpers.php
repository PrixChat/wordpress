<?php

function prixchat_escape( $data ) {
    if ( is_object( $data ) ) {
        $data  = (array) $data;
    }
    
    foreach ( $data as $field => $value ) {
        if ( is_array( $value ) || is_object( $value ) ) {
            $data[$field] = prixchat_escape( $value );
        } else {
            if ( $field == 'content' ) {
                $data[$field] = wp_kses_post( $value );
            } else {
                $data[$field] = esc_html( $value );
            }
        }
    }

    return $data;
}

function prixchat_default_settings()
{
    $settings = [
        'emojis' => '😀😂😊😉😍👍',
        'roles' => 'all',
        'incoming_messages_sound' => '',
    ];

    return $settings;
}

function prixchat_get_settings( $key = null, $default = false )
{
    $settings = get_option( 'prixchat_settings' );
    
    if ( ! $settings ) {
        $settings = prixchat_default_settings();
    }

    if (is_null($key)) {
        return $settings;
    }

    if ($key === 'emojis') {
        $emojis = $settings[$key];
        $emojis = str_replace(' ', '', $emojis);
        $emojis = explode(',', $emojis);
        $emojis = array_unique($emojis);

        return $emojis;
    }

    if ($key === 'roles') {
        $roles = $settings[$key];
        $roles = $roles !== 'all' ? unserialize($roles) : 'all';

        return $roles;
    }

    if ( isset( $settings[$key] ) ) {
        return $settings[$key];
    }

    return $default;
}
