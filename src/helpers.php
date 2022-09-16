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