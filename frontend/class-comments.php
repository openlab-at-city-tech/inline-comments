<?php
class INCOM_Comments extends INCOM_Frontend {

	private $loadCancelLinkText = 'Cancel';
	private $DataIncomValue = NULL;
	private $DataIncomKey = 'data_incom';
	private $DataIncomKeyPOST = 'data_incom';

	function __construct() {
		add_filter( 'get_comment_text' , array( $this, 'comment_text' ), 10, 2 );
		add_action( 'comment_post', array( $this, 'add_comment_meta_data_incom' ) );
		add_action( 'preprocess_comment' , array( $this, 'preprocess_comment_handler' ) );
		add_action( 'wp_footer', array( $this, 'generateCommentsAndForm' ) );
	}

	/**
	 * Filter comment_text
	 * @since 2.1
	 */
	function comment_text( $comment_text, $comment ) {
		if ( isset($comment) && ( get_option(INCOM_OPTION_KEY.'_references') != "nowhere" ) ) {
			$comment_text = $this->comment_text_reference( $comment_text, $comment );
		}
		return $comment_text;
	}

	/**
	 * Add reference to referenced paragraph/element
	 * @since 2.1
	 */
	private function comment_text_reference( $comment_text, $comment ) {
		if ( $this->DataIncomKey != '' ) {
			$data_incom = get_comment_meta( $comment->comment_ID, $this->DataIncomKey, true );

			if ( $data_incom != '' ) {	// Only display reference when comment actually references on a paragraph/element
				$jump_to_text = esc_html__( 'See this comment in context.', 'inline-comments' );

				$jump_to = sprintf(
					'<a href="%s" class="incom-jump-to" data-incom-ref="%s" data-incom-comment-id="%s">%s</a>',
					esc_attr( '#incom-elemente-' . $data_incom ),
					esc_attr( $data_incom ),
					esc_attr( $comment->comment_ID ),
					esc_html__( 'See this comment in context.', 'inline-comments' )
				);

				$comment_text .= "<span class='incom-ref'>$jump_to</span>";
			}
		}

		return $comment_text;
	}

	/**
	 * Set $DataIncomValue
	 */
	private function setValueDataIncom() {
		if ( isset( $_POST[ $this->DataIncomKeyPOST ] ) ) {
			$value = sanitize_text_field( $_POST[ $this->DataIncomKeyPOST ] );
		} else {
			$value = NULL;
		}

		// If this is a reply, the value is stored in the parent comment.
		if ( isset( $_POST['comment_parent'] ) && (int) $_POST['comment_parent'] !== 0 ) {
			$parent_comment = get_comment( $_POST['comment_parent'] );
			$value          = get_comment_meta( $parent_comment->comment_ID, $this->DataIncomKey, true );
		}

		$this->DataIncomValue = $value;
	}

	/**
	 * Get the 'data_incom' value for a comment, which is the label for associated element in the post content.
	 *
	 * If none is found stored on the comment, we traverse the parents until we find one.
	 *
	 * @param int $comment_id The comment ID.
	 * @return string|null
	 */
	private function get_data_incom_value( $comment_id ) {
		$data_incom = get_comment_meta( $comment_id, $this->DataIncomKey, true );

		if ( ! $data_incom ) {
			$comment = get_comment( $comment_id );
			if ( $comment->comment_parent ) {
				$data_incom = $this->get_data_incom_value( $comment->comment_parent );
			}
		}

		return $data_incom;
	}

	/**
	 * Get $DataIncomValue
	 */
	private function getValueDataIncom() {
		return $this->DataIncomValue;
	}

	/**
	 * Generate comments form
	 */
	function generateCommentsAndForm() {
		$dco_enabled = false;
		if ( isset( $GLOBALS['dco_ca'] ) && is_object( $GLOBALS['dco_ca'] ) && method_exists( $GLOBALS['dco_ca'], 'add_attachment_field' ) ) {
			$dco_enabled = true;
			remove_action( 'comment_form_submit_field', [ $GLOBALS['dco_ca'], 'add_attachment_field' ] );
		}

		add_filter( 'dco_ca_disable_attachment_field', '__return_true' );

		echo '<div id="comments-and-form" class="comments-and-form" style="display:none">';

		$this->loadPluginInfoInvisible();

		do_action( 'incom_cancel_x_before' );
		echo wp_kses_post(apply_filters( 'incom_cancel_x', $this->loadCancelX() ));
		do_action( 'incom_cancel_x_after' );

		echo wp_kses_post(apply_filters( 'incom_comments_list_before', $this->comments_list_before() ));

		if (!parent::are_inline_comments_disabled()) {
			$this->loadCommentsList();
		}

		if (parent::can_comment()) {
			$this->loadCommentForm();
		}

		echo '</div>';

		if ( $dco_enabled ) {
			add_action( 'comment_form_submit_field', [ $GLOBALS['dco_ca'], 'add_attachment_field' ] );
		}
	}

	/**
	 * Display invisible plugin info
	 */
	private function loadPluginInfoInvisible() {
		echo '<!-- ## OpenLab Inline Comments by Kevin Weber - kevinw.de/inline-comments ## -->';
	}

	/**
	 * Generate list with comments
	 */
	private function loadCommentsList() {
		$args = array(
			'post_id'     => get_the_ID(),
			'type'        => 'comment',
			'callback'    => array( $this, 'loadComment' ),
			'avatar_size' => parent::get_avatar_size(),
		);

		// Block themes won't load comments into the main $wp_query, so we must
		// load them separately and pass them to wp_list_comments.
		$comments = get_comments(
			[
				'post_id' => get_the_ID(),
				'type'    => 'comment',
				'status'  => 'approve',
				'order'   => 'ASC',
			]
		);

		// We have to modify the HTML to ensure unique IDs, so we buffer the output.
		ob_start();
		wp_list_comments( apply_filters( 'incom_comments_list_args', $args ), $comments );
		$comments_list = ob_get_clean();

		// Replace id attributes of the form 'comment-123' with 'incom-comment-123'.
		$comments_list = preg_replace( '/id="comment-(\d+)"/', 'id="incom-comment-$1"', $comments_list );

		echo $comments_list;
	}

	/**
	 * Generate a single comment
	 */
	function loadComment($comment, $args, $depth) {
		$GLOBALS['comment'] = $comment;
		extract($args, EXTR_SKIP);

		if ( 'div' == $args['style'] ) {
			$tag = 'div';
			$add_below = 'comment';
		} else {
			$tag = 'li';
			$add_below = 'div-comment';
		}

		// Temp?
		$args['avatar_size'] = 16;

		$args['max_depth'] = 3;

		$data_incom = $this->get_data_incom_value( $comment->comment_ID );

		?>

		<<?php echo $tag; /* XSS ok */ ?> <?php comment_class( empty( $args['has_children'] ) ? '' : 'parent' ) ?> id="comment-<?php comment_ID() ?>" data-incom-comment="<?php echo esc_attr( $data_incom ); ?>" style="display:none">
		<?php if ( 'div' != $args['style'] ) : ?>

		<div id="incom-div-comment-<?php comment_ID() ?>" class="incom-div-comment inline-comment-body">

		<?php
			endif;

			if ( (get_option(INCOM_OPTION_KEY."_comment_permalink") == "1") ) {
				echo wp_kses_post(apply_filters( 'incom_comment_permalink', $this->loadCommentPermalink( $comment->comment_ID ) ));
			}
		?>

		<div class="inline-comment-author vcard">
			<?php if ( $args['avatar_size'] != 0 ) echo get_avatar( $comment, $args['avatar_size'] ); ?>
			<?php printf( __( '<cite class="fn">%s</cite>' ), get_comment_author_link() ); ?>
		</div>

		<?php if ( $comment->comment_approved == '0' ) : ?>
			<em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.' ); ?></em>
			<br />
		<?php endif; ?>

		<div class="incom-comment-text">
			<?php comment_text(); ?>
		</div>

		<?php if ( get_option( 'incom_reply' ) == '1' ) { ?>
			<div class="incom-comment-actions">
				<?php if ( empty( $comment->comment_parent ) ) : ?>
					<div class="incom-showhide-replies">
						<button class="incom-show-replies"><?php esc_html_e( 'Show Replies', 'inline-comments' ); ?></button>
					</div>
				<?php endif; ?>

				<div class="incom-reply">
				<?php
				add_filter( 'comment_reply_link', array( $this, 'replace_id_in_comment_reply_link' ), 10 );

				comment_reply_link( array_merge(
						$args,
						array(
							'add_below' => 'incom-div-comment',
							// 'respond_id' => 'incom-commentform',
							// TODO: 'reply_text' => 'insert icon here',
							'depth' => $depth,
							'max_depth' => $args['max_depth'],
							'login_text' => '',
							'reply_title_id' => 'incom-reply-title',
						)
					)
				);

				remove_filter( 'comment_reply_link', array( $this, 'replace_id_in_comment_reply_link' ), 10 );
				remove_filter( 'comment_id_fields', array( $this, 'replace_id_in_comment_id_fields' ), 10 );
				?>
				</div>
			</div>
		<?php } ?>

		<?php if ( 'div' != $args['style'] ) : ?>
		</div>
		<?php endif; ?>
	<?php
	}

	/**
	 * Load comment form
	 */
	function loadCommentForm() {
		$user = wp_get_current_user();
		$user_identity = $user->exists() ? $user->display_name : '';

		$avatar_size = 16;

		$logged_in_as = sprintf(
			'<div class="logged-in-as inline-comment-author vcard">
				%s
				<cite class="fn">%s</cite>
			</div>',
			get_avatar( get_current_user_id(), $avatar_size ),
			esc_html( bp_core_get_user_displayname( get_current_user_id() ) )
		);

		$comment_notes_before = sprintf(
			'<div class="incom-comment-notes">%s</div>',
			esc_html__( 'Comment', 'inline-comments' )
		);

		$comment_field = sprintf(
			'<p class="incom-form-comment">%s %s</p>',
			sprintf(
				'<label for="comment" class="screen-reader-text">%s</label>',
				_x( 'Comment', 'noun', 'inline-comments' )
			),
			'<textarea id="incom-comment" name="comment" cols="45" rows="8" maxlength="65525" required></textarea>'
		);

		$commenter = wp_get_current_commenter();

		$fields = [
		  'author' =>
		    '<p class="incom-form-author"><label for="incom-author">' . esc_html__( 'Name', 'inline-comments' ) . '</label> ' .
		    '<input id="incom-author" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) .
		    '" size="30" /></p>',

		  'email' =>
		    '<p class="incom-form-email"><label for="incom-email">' . esc_html__( 'Email', 'inline-comments' ) . '</label> ' .
		    '<input id="incom-email" name="email" type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) .
		    '" size="30" /></p>',
		];

		if ( get_option( 'incom_field_url' ) !== '1' ) {
			$fields['url'] = '<p class="incom-form-url"><label for="incom-url">' . esc_html__( 'Website', 'inline-comments' ) . '</label>' .
			    '<input id="incom-url" name="url" type="text" value="' . esc_attr( $commenter['comment_author_url'] ) .
			    '" size="30" /></p>';
		}

		$args = array(
			'id_form' => 'incom-commentform',
			'fields' => $fields,
			'class_container' => 'incom-comment-respond',
			'class_form' => 'incom-form',
			'comment_field' => $comment_field,
			'comment_form_before' => '',
			'comment_notes_before' => $comment_notes_before,
			'comment_notes_after' => '',
			'title_reply' => '',
			'title_reply_to' => '',
			'label_submit' => __( 'Post comment', 'inline-comments' ),
			'logged_in_as' => $logged_in_as,
			'user_identity' => $user_identity,
			'submit_field' => '<div class="incom-form-submit">%1$s %2$s</div>',
		);

		// Buffer so that we can swap out the div ID, which is not filterable.
		ob_start();
		comment_form( apply_filters( 'incom_comment_form_args', $args ) );
		$form = ob_get_clean();

		// Replace IDs with our own.
		$form = str_replace(
			[ 'id="respond"', "id='comment_parent'", "id='comment_post_ID'", 'id="submit"' ],
			[ 'id="incom-respond"', "id='incom-comment_parent'", "id='incom-comment_post_ID'", 'id="incom-submit"'],
			$form
		);

		echo $form;
	}

	/**
	 * Filters the comment reply link.
	 *
	 * We do this to change the 'comment-reply-link' class to our own 'incom-reply-link'
	 * class. This is necessary to prevent the default comment-reply-link JS from working.
	 * We need our incom-reply-link to move our custom comment form, not the default WP one.
	 *
	 * @param string $link The comment reply link.
	 */
	public function replace_id_in_comment_reply_link( $link ) {
		$class_regex = '/class=([\'"])([^\'"]*)comment-reply-link([^\'"]*)([\'"])/';
		$link = preg_replace( $class_regex, 'class=$1$2incom-reply-link$3$4', $link );
		return $link;
	}

	/**
	 * Add comment meta field to comment form
	 */
	function add_comment_meta_data_incom( $comment_id ) {
		$DataIncomValue = $this->getValueDataIncom();
		if ( $DataIncomValue !== NULL ) {
			add_comment_meta( $comment_id, $this->DataIncomKey, $DataIncomValue, true );
		}
	}

	/**
	 * This function will be executed immediately before a comment will be stored into database
	 */
	function preprocess_comment_handler( $commentdata ) {
		$this->setValueDataIncom();
		$commentdata[ $this->DataIncomKey ] = $this->DataIncomValue;

		return $commentdata;
	}

	/**
	 * Load permalink to comment
	 */
	private function loadCommentPermalink( $comment_ID ) {
		$permalink_url = htmlspecialchars( get_comment_link( $comment_ID ) );
		$permalink_img_url = plugins_url( 'images/link.svg', INCOM_FILE );
		$permalink_html = '<div class="comment-meta commentmetadata">
			<a class="incom-permalink" href="' . $permalink_url . '" title="Permalink to this comment">
				<img class="incom-permalink-img" src="' . $permalink_img_url . '" alt="">
			</a>
		</div>';
		return $permalink_html;
	}

	/*
	 * Load cancel cross (remove wrapper when user clicks on that cross)
	 */
	private function loadCancelX() {
		if ( get_option( 'cancel_x' ) !== '1' ) {
			return sprintf(
				'<a class="incom-cancel incom-cancel-x" href title="%s"><img src="%s" alt="%s" height="15" width="15" /></a>',
				esc_attr__( 'Close', INCOM_TD ),
				esc_attr( INCOM_URL . '/images/close.svg' ),
				esc_html__($this->loadCancelLinkText, INCOM_TD )
			);
		}
	}

	/**
	 * Add content before comment list
	 */
	function comments_list_before() {
		if ( get_option( 'incom_content_comments_before' ) != '' ) {
			return get_option( 'incom_content_comments_before' );
		}
	}

	/**
	 * Customise comment form
	 */
	// function comment_form_args( $args ) {
	// 	$args['comment_notes_after'] = '';
	// 	return $args;
	// }

}
