<?php
/**
 * Create options panel (http://codex.wordpress.org/Creating_Options_Pages)
 * @package Admin
 */

class INCOM_Admin_Options {
	protected static $options = [
		// Basics
		'incom_status_default',
		'multiselector',
		'incom_support_for_ajaxify_comments',
		'incom_reply',
		'moveselector',
		'incom_attribute',

		// Styling
		'custom_css',
		'incom_select_align',
		'incom_avatars_display',
		'incom_avatars_size',
		'select_bubble_style',
		'set_bgcolour',
		'incom_set_bgopacity',
		'incom_bubble_static',

		// Advanced
		'incom_content_comments_before',
		'select_bubble_fadein',
		'select_bubble_fadeout',
		'cancel_x',
		'cancel_link',
		'incom_field_url',
		'incom_comment_permalink',
		'incom_references',
		'incom_bubble_static_always',
	];

	function __construct() {
		$this->register_incom_settings();
		add_action( 'admin_menu', array( $this, 'incom_create_menu' ));
		add_action( 'admin_init', array( $this, 'admin_init_options' ) );
	}

	function admin_init_options() {
		if ( isset( $_GET['page'] ) && ( $_GET['page'] == 'incom.php') ) {
			add_action( 'admin_footer', array( $this, 'incom_admin_css' ) );
			add_action( 'admin_footer', array( $this, 'incom_admin_js' ) );
		}
		$plugin = plugin_basename( INCOM_FILE );
		add_filter("plugin_action_links_$plugin", array( $this, 'incom_settings_link' ) );
	}

	/**
	 * Add settings link on plugin page
	 */
	function incom_settings_link($links) {
	  $settings_link = '<a href="options-general.php?page=incom.php">'.esc_html__( 'Settings', INCOM_TD ).'</a>';
	  array_unshift($links, $settings_link);
	  return $links;
	}

	function incom_create_menu() {
		add_options_page( esc_html__( 'OpenLab Inline Comments', INCOM_TD ), esc_html__( 'OpenLab Inline Comments', INCOM_TD ), 'manage_options', 'incom.php', array( $this, 'incom_settings_page'));
	}

	function register_incom_settings() {
		foreach ( self::$options as $i ) {
			$default = $this->get_default_option_value( $i );

			register_setting(
				'incom-settings-group',
				$i,
				[
					'default' => $default,
				]
			);
		}
		do_action( 'register_incom_settings_after' );
	}

	function incom_settings_page()	{
      require_once( INCOM_PATH . 'admin/admin-options.php' );
	}

	function incom_admin_js() {
		if ( defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ) {
			wp_enqueue_script( 'lazyload_admin_js', INCOM_URL . 'js/admin.js', array('jquery', 'jquery-ui-tabs', 'wp-color-picker' ), INCOM_VERSION );
		} else {
			wp_enqueue_script( 'lazyload_admin_js', INCOM_URL . 'js/min/admin.min.js', array('jquery', 'jquery-ui-tabs', 'wp-color-picker' ), INCOM_VERSION );
		}
	}

	function incom_admin_css() {
		wp_enqueue_style( 'incom_admin_css', plugins_url('../css/min/admin.css', __FILE__) );
		wp_enqueue_style( 'wp-color-picker' );	// Required for colour picker
	}

	protected function get_default_option_value( $option ) {
		switch ( $option ) {
			case 'incom_reply' :
				return '1';
			break;

			default :
				return '';
			break;
		}
	}

	public static function get_option( $option ) {
		if ( ! in_array( $option, self::$options ) ) {
			return false;
		}

		switch ( $option ) {
			case 'incom_reply' :
				$value = get_option( $option );
			break;

			default :
				return get_option( $option );
			break;
		}
	}
}

function initialize_incom_admin_options() {
	new INCOM_Admin_Options();
}
add_action('init', 'initialize_incom_admin_options');
