<?php
/**
 * @package Admin
 */

add_action( 'init', 'allow_ksas_data' );

/**
 * Register additional HTML attributes for WP KSES
 * Based on https://vip.wordpress.com/documentation/register-additional-html-attributes-for-tinymce-and-wp-kses/
 * @since 2.1.2
 */
function allow_ksas_data() {
    global $allowedposttags;

    $tags = array( 'span' );
    $new_attributes = array( 'data-incom-ref' => array() );

    foreach ( $tags as $tag ) {
        if ( isset( $allowedposttags[ $tag ] ) && is_array( $allowedposttags[ $tag ] ) )
            $allowedposttags[ $tag ] = array_merge( $allowedposttags[ $tag ], $new_attributes );
    }
}
