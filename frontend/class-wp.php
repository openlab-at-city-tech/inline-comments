<?php
/**
 * @package Comment System Type: WordPress
 */
class INCOM_WordPress extends INCOM_Frontend {

	function __construct() {
		$this->addActions();
	}

	function addActions() {
		add_action( 'wp_enqueue_scripts', array( $this, 'incom_enqueue_scripts' ) );
		add_action( 'wp_footer', array( $this, 'load_incom'), 444, 'functions' );
		add_action( 'wp_enqueue_scripts', array( $this, 'load_incom_style') );
	}

	/**
	 * Add Scripts into Footer
	 */
	function load_incom() {
		$default_selectors = 'p,figure,blockquote,ul,ol,embed,iframe,h1,h2,h3,h4,h5,h6';

		?>
		<script>
		(function ( $ ) {
			var icTimer;

			$(window).on( "load", function() {
				incom.init({
					canComment: <?php echo parent::can_comment() == "" ? "false" : "true"; ?>,
					selectors: '<?php echo get_option("multiselector") == "" ? $default_selectors : get_option("multiselector"); ?>',
					moveSiteSelector: '<?php echo get_option("moveselector") == "" ? "body" : esc_js(get_option("moveselector")); ?>',
			    countStatic: <?php echo get_option("incom_bubble_static") == "1" ? "false" : "true"; ?>,
			    alwaysStatic: <?php echo get_option("incom_bubble_static_always") == "1" ? "true" : "false"; ?>,
			    bubbleStyle: '<?php echo get_option("select_bubble_style") == "" ? "bubble" : esc_js(get_option("select_bubble_style")); ?>',
			    bubbleAnimationIn: '<?php echo get_option("select_bubble_fadein") == "" ? "default" : esc_js(get_option("select_bubble_fadein")); ?>',
			    bubbleAnimationOut: '<?php echo get_option("select_bubble_fadeout") == "" ? "default" : esc_js(get_option("select_bubble_fadeout")); ?>',
				  // defaultBubbleText: '+',
			    // highlighted: false,
			    position: '<?php echo get_option("incom_select_align") == "" ? "right" : esc_js(get_option("incom_select_align")); ?>',
			    background: '<?php echo get_option("set_bgcolour") == "" ? "#fff" : esc_js(get_option("set_bgcolour")); ?>',
					backgroundOpacity: '<?php echo get_option("incom_set_bgopacity") == "" ? "1" : esc_js(get_option("incom_set_bgopacity")); ?>',
					displayBranding: <?php echo get_option("incom_attribute") == "link" ? "true" : "false"; ?>,
					<?php do_action( 'incom_wp_set_options' ); ?>
				});
			});
		})(jQuery);
		</script>
	<?php }

	/**
	 * Add scripts (like JS)
	 */
	function incom_enqueue_scripts() {
		wp_enqueue_script(
			'incom-js',
			plugins_url( 'js/min/inline-comments.min.js' , plugin_dir_path( __FILE__ ) ),
			[ 'jquery', 'wp-i18n' ],
			filemtime( INCOM_PATH . '/js/min/inline-comments.min.js' ),
		);

		$comment_incom_keys = $this->get_comment_incom_keys();

		wp_add_inline_script(
			'incom-js',
			'var incom = incom || {};
			incom.commentKeys = ' . json_encode( $comment_incom_keys ) . ';',
			'before'
		);
	}

	/**
	 * Add stylesheet
	 */
	function load_incom_style() {
		wp_register_style( 'incom-style', plugins_url('css/min/style-wp.css', plugin_dir_path( __FILE__ ) ) );
		wp_enqueue_style( 'incom-style' );
	}

	/**
	 * Add Custom CSS
	 */
	function load_custom_css(){
		echo '<style type="text/css">';

		// User's custom CSS input
		if (stripslashes(get_option('custom_css')) != '') {
			echo esc_html(stripslashes(get_option('custom_css')));
		}

		echo '</style>';
	}

	public function get_comment_incom_keys() {
		$comment_incom_keys = [];

		if ( is_singular() ) {
			$comments = get_comments(
				[
					'post_id' => get_the_ID(),
					'status' => 'approve',
				]
			);

			foreach ( $comments as $comment ) {
				$comment_incom_keys[ $comment->comment_ID ] = get_comment_meta( $comment->comment_ID, 'data_incom', true );
			}
		}
		return $comment_incom_keys;
	}
}
