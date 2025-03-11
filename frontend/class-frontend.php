<?php
/**
 * @package Frontend
 */
class INCOM_Frontend {
    private static $status_body_class = 'inline-comments';

    function init() {
        if (!is_admin() && $this->are_inline_comments_disabled()) {
            self::$status_body_class = 'inline-comments-off';
            add_filter( 'body_class' , array( $this, 'body_class' ) );
            return;
        }

		add_filter( 'body_class' , array( $this, 'body_class' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_jquery' ) );
        require_once( INCOM_PATH . 'frontend/class-wp.php' );
        new INCOM_WordPress();

    }

	/**
	 * Add class to <body> that identifies the usage of this plugin
	 * @since 2.1
	 */
	function body_class( $classes ) {
		$classes[] = self::$status_body_class;
		return $classes;
	}

	/**
 	 * Enable jQuery (comes with WordPress)
 	 */
 	function enqueue_jquery() {
     	wp_enqueue_script( 'jquery' );
 	}

	/**
	 * Handle avatar size
	 */
	protected function get_avatar_size() {
		return '16';
	}

	/**
	 * Determine if user is allowed to comment.
	 * Logged in users are always allowed to comment.
 	 * @since 2.2.3
	 */
	protected function can_comment() {
		return comments_open() && (!get_option('comment_registration') || is_user_logged_in());
	}

 	/**
 	 * Test if inline comments are disabled for a specific post or page
 	 */
 	function are_inline_comments_disabled() {
		global $post;

		$result = true;

		if ( ! isset( $post->ID ) ) {
			$post_id = null;
		} else {
			$post_id = $post->ID;
		}

		$status_default = get_option( INCOM_OPTION_KEY . '_status_default', 'on_posts_pages' );
		$post_status    = get_post_meta( $post_id, INCOM_OPTION_KEY . '_status', true );

		// When the individual status for a page/post is 'off', override all other settings.
		if ( $post_status === 'off' ) {
			$result = true;
		} elseif ( $status_default === 'logged_in' && ! is_user_logged_in() ) {
			// If only logged-in users can comment but the user isn’t logged in.
			$result = true;
		} elseif (
			! $status_default || // Load when no option is defined yet.
			$post_status === 'on' && is_singular() ||
			$status_default === 'on' ||
			( $status_default === 'on_posts' && is_single() ) ||
			( $status_default === 'on_pages' && is_page() ) ||
			( $status_default === 'on_posts_pages' && ( is_single() || is_page() ) ) ||
			( $status_default === 'on_posts_pages_custom' &&
				( is_single() || is_page() || get_post_types( [ 'public' => true, '_builtin' => false ] ) )
			)
		) {
			$result = false;
		}

		$result = apply_filters( INCOM_OPTION_KEY.'_are_inline_comments_disabled', $result );
		return $result;
 	}
}

function initialize_incom_frontend() {
    $frontend = new INCOM_Frontend();
    $frontend->init();
}
add_action( 'wp', 'initialize_incom_frontend' );



function initialize_incom_comment_submission() {
  require_once( INCOM_PATH . 'frontend/class-comments.php' );
  new INCOM_Comments();
}
add_action( 'init', 'initialize_incom_comment_submission' );
