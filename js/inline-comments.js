/* global jQuery */

/*
 * Inline Comments
 * by Kevin Weber
 */

(function (incom, $) {
	'use strict';

	let o

	// IDs
	const
		idWrapper = 'incom_wrapper',
		idWrapperHash = '#' + idWrapper,
		idWrapperAppendTo = 'html',
		idCommentsAndForm = 'comments-and-form',
		idCommentsAndFormHash = '#' + idCommentsAndForm,
		idCommentForm = 'incom-commentform',

		// Attributes
		attDataIncom = 'data-incom',
		attDataIncomComment = attDataIncom + '-comment',
		attDataIncomBubble = attDataIncom + '-bubble',
		attDataIncomRef = attDataIncom + '-ref',

		// Classes
		classActive = 'incom-active',
		classActiveDot = '.' + classActive,
		classVisibleComment = 'incom-visible-comment',
		classVisibleCommentDot = '.' + classVisibleComment,
		classPosition = 'incom-position-', // Expects that o.position follows ('left' or 'right')
		classBubble = 'incom-bubble',
		classBubbleDot = '.' + classBubble,
		classBubbleStyle = classBubble + '-style',
		classBubbleStatic = classBubble + '-static',
		classBubbleStaticDot = '.' + classBubbleStatic,
		classBubbleDynamic = classBubble + '-dynamic',
		classBubbleActive = classBubble + '-active', // Class for currently selected bubble
		classBubbleLink = classBubble + '-link',
		classCommentsWrapper = 'incom-comments-wrapper',
		classCommentsWrapperDot = '.' + classCommentsWrapper,
		classReply = 'incom-reply',
		classReplyDot = '.' + classReply,
		classCancel = 'incom-cancel', // When a user clicks on an element with this class, the comments wrapper will be removed
		classCancelDot = '.' + classCancel,
		classBranding = 'incom-info-icon',
		classBrandingDot = '.' + classBranding,
		classScrolledTo = 'incom-scrolled-to',

		// Other
		dataIncomKey = 'data_incom', // Should be the same as $DataIncomKey in class-comments.php
		attDataIncomArr = [] // Array that contains all attDataIncom values

	let
		slideWidth = 0, // Shift page content o.moveSiteSelector to the left
		lastFocusedBubble = null,
		$viewportW = $(window).width(),
		$elementW,
		$offsetL,
		$sumOffsetAndElementW;

	/**
	 * Rebuild bubbles and content data attributes
	 */
	incom.rebuild = function () {
		// Reset
		$viewportW = $(window).width();

		// Remove all items from attDataIncomArr
		while (attDataIncomArr.length > 0) {
			attDataIncomArr.pop();
		}

		$('#incom_wrapper .incom-bubble').remove();

		// Re-init bubbles
		initElementsAndBubblesFromSelectors();

		// Reset sidebar form if visible
		const commentsForm = $(idCommentsAndFormHash + ':visible');
		if (commentsForm.length) {
			removeCommentsWrapper();
			moveSite('out');
		}
	};

	/*
	 * Private methods
	 */
	const setOptions = function (options) {
		// 'options' overrides these defaults
		o = $.extend(
			{
				canComment: true,
				selectors: 'p',
				moveSiteSelector: idWrapperAppendTo,
				countStatic: true,
				alwaysStatic: false,
				defaultBubbleText: '+',
				bubbleStyle: 'bubble',
				bubbleAnimationIn: 'default',
				bubbleAnimationOut: 'default',
				// highlighted: false,
				position: 'left',
				background: 'white',
				backgroundOpacity: '1',
				displayBranding: false,
			},
			options
		);
	};

	/*
	 * This wrapper contains comment bubbles
	 */
	const initIncomWrapper = function () {
		let docFragment,
			wrapper,
			wrapperParent;

		if ($(idWrapperHash).length === 0) {
			docFragment = document.createDocumentFragment();
			wrapper = document.createElement("div");
			wrapperParent = document.querySelector(idWrapperAppendTo);

			wrapper.setAttribute("id", idWrapper);
			wrapper.className = classPosition + o.position;

			docFragment.appendChild(wrapper);
			wrapperParent.appendChild(docFragment);
		}

		initElementsAndBubblesFromSelectors();
	};

	/*
	 * Setup elements and bubbles that depend on selectors
	 */
	const initElementsAndBubblesFromSelectors = function () {
		const $contentArea = findContentArea();
		const elementsBySelectors = $contentArea.find( o.selectors );

		const l = elementsBySelectors.length;

		for ( let j = 0; j < l; j++ ) {
			const $that = $(elementsBySelectors[j]);
			addAttToElement($that);
			bubble.createFromElement($that);
		}
	};

	/**
	 * Uses heuristics to identify the post content area.
	 *
	 * @return {jQuery} The content area.
	 */
	const findContentArea = function() {
		const $content = $( '.entry-content' );

		if ( $content.length ) {
			return $content;
		}

		const $main = $( 'main' );
		if ( $main.length && 1 === $main.length ) {
			return $main;
		}

		return $( 'body' );
	}

	/**
	 * Add attribute attDataIncom to element; increase counter per element type (instead of using one counter for all elements independent of their types).
	 *
	 * @param {jQuery} $element The element to add the attribute to.
	 */
	const addAttToElement = function ($element) {
		let i = 0;

		// Only proceed if element has no attribute attDataIncom yet
		const elementDataIncomAttr = $element.data( 'incom' );
		if ( elementDataIncomAttr ) {
			return;
		}

		const identifier = getIdentifier($element);

		// Increase i when specific attProp (value of attDataIncom) already exists
		i = increaseIdentifierNumberIfAttPropExists(i, identifier);

		const attProp = identifier + i; // WOULD BE BETTER: var attProp = identifier + '-' + i; // BUT THAT WOULD CONFLICT WITH ALREADY STORED COMMENTS

		//@TODO: Add part that assigns comment to specific article/page/post (article-id); include fallback in cause a comment has no ID (yet)

		$element.attr(attDataIncom, attProp);

		$element.attr( 'id', 'incom-element-' + attProp );
	};

	const bubble = {
		/*
		 * Set bubble position and visibility
		 */
		//@TODO
		/*
		set (options) {
			const opt = $.extend(
				{
					posX: undefined,
					posY: undefined,
					id: undefined,
					visible: false,
				},
				options
			);

			if (!exists … && id !== undefined ) {
				createBubble + addAtt
			} else if ( ( posX && posY ) !== undefined && ( changedPosX || changedPosY ) ) {
				recalculatePos
			}

			if ( opt.visible ) {
				displayBubble
			}
		},
		*/

		/*
		 * Add bubble depending on an element
		 */
		createFromElement ($element) {
			//@TODO
			addBubble($element);
		}
	};

	/*
	 * Example: Getter and Setter
	 */
	// function Selectors( val ) {
	//    var selectors = val;

	//    this.getValue = function(){
	//        return selectors;
	//    };

	//    this.setValue = function( val ){
	//        selectors = splitSelectors( val );
	//    };
	// }

	/*
	 * Use the first five letters of the element's name as identifier
	 * @return string
	 */
	const getIdentifier = function (element) {
		const identifier = element.prop('tagName').substr(0, 5);
		return identifier;
	};

	/*
	 * Increase identifier number (i) if that specific attProp was already used. attProp must be unique
	 * @return int
	 */
	const increaseIdentifierNumberIfAttPropExists = function (i, identifier) {
		let attProp = identifier + i;

		if ($.inArray(attProp, attDataIncomArr) !== -1) {
			while ($.inArray(attProp, attDataIncomArr) !== -1) {
				i++;
				attProp = identifier + i;
			}
		}

		attDataIncomArr.push(attProp);

		return i;
	};

	/*
	 * Add bubbles to each element
	 */
	const addBubble = function (source) {
		const bubbleText = addBubbleText(source);
		const bubbleContainer = loadBubbleContainer(source);
		const $bubble = $(
			'<a/>',
			{
				href: '',
				'class': classBubbleLink,
			}
		)
			.text(bubbleText)
			.wrap(bubbleContainer)
			.parent()
			.appendTo(idWrapperHash);

		setDisplayStatic($bubble);
		setBubblePosition(source, $bubble);

		if (!isInWindow($bubble)) {
			$bubble.hide();
		} else {
			handleHover(source, $bubble);

			$bubble.on(
				'click',
				function (e) {
					e.preventDefault();

					const isKeyboardEvent = e.detail === 0;

					handleClickBubble(source, $bubble, isKeyboardEvent);

					// If this was a keyboard event, focus the first input field.
					if ( isKeyboardEvent ) {
						$( idCommentsAndFormHash + ' textarea' ).first().focus();
					}
				}
			);
		}
	};

	/*
	 * Get text/number that should be displayed in a bubble
	 */
	const addBubbleText = function (source) {
		let bubbleText;

		if (testIfCommentsCountLarger0(source)) {
			bubbleText = countComments(source);
		} else {
			bubbleText = o.defaultBubbleText;
		}

		return bubbleText;
	};

	/*
	 * Count the number of comments that are assigned to a specific paragraph
	 */
	const countComments = function (source) {
		// Get attribute value from source's attribute attDataIncom
		const attFromSource = source.attr(attDataIncom);

		/*
		 * Define selector that identifies elements that shall be counted.
		 *
		 * Only count those in the main comment thread, so we don't get double-counted.
		 */
		const selectByAtt = idCommentsAndFormHash + ' [' + attDataIncomComment + '="' + attFromSource + '"]';

		// Count elements
		let $count = $(selectByAtt).length;
		// Increase count for each inline reply, too
		$count += $(selectByAtt + ' .children li').length;

		return $count;
	};

	/*
	 * Get container that contains the bubble link
	 */
	const loadBubbleContainer = function (source) {
		const bubbleValue = source.attr(attDataIncom);
		const text = '<div class="' + loadBubbleContainerClass(source) + '" ' + attDataIncomBubble + '="' + bubbleValue + '" />';
		return text;
	};

	/*
	 * Generate class for bubbleContainer
	 */
	const loadBubbleContainerClass = function (source) {
		let containerClass = classBubble;
		const space = ' ';

		if (
			(o.alwaysStatic) ||
			(testIfCommentsCountLarger0(source) && o.countStatic)
		) {
			containerClass += space + classBubbleStatic;
		}

		if (
			testIfCommentsCountLarger0(source) ||
			(!testIfCommentsCountLarger0(source) && (o.bubbleStyle === 'bubble'))
		) {
			containerClass += space + classBubbleStyle;
		} else {
			containerClass += space + classBubbleDynamic;
		}

		return containerClass;
	};

	/*
	 * Test if comments count is larger than 0
	 */
	const testIfCommentsCountLarger0 = function (source) {
		const count = countComments(source);
		return ( isNumeric( count ) && count > 0 ) ? true : false;
	};

	const setDisplayStatic = function ( theBubble ) {
		if ( theBubble.hasClass( classBubbleStatic ) ) {
			theBubble.css( 'display', 'block' );
		}
	};

	const isNumeric = ( value ) => {
		return typeof value === 'number' && isFinite( value ) || !isNaN( Number( value ) );
	}

	/*
	 * This event will be triggered when user hovers a text element or bubble
	 */
	const handleHover = function ( element, theBubble ) {
		if ( ! theBubble.hasClass( classBubbleStatic ) && o.canComment ) {
			// Handle hover (for both, "elements" and $bubble)
			element.add( theBubble );

			element.on( 'mouseenter', function() {
				mouseEnterCallback( theBubble );
			} );

			element.on( 'mouseleave', function() {
				mouseLeaveCallback( theBubble );
			} );
		}
	};

	/**
	 * mouseenter callback.
	 *
	 * @param {jQuery} theBubble The bubble that is being hovered.
	 */
	const mouseEnterCallback = function( theBubble ) {
		// First hide all non-static bubbles
		$(classBubbleDot + ':not(' + classBubbleStaticDot + ')').hide();

		if (o.bubbleAnimationIn === 'fadein') {
				theBubble.stop(true, true).fadeIn();
		} else {
				theBubble.stop(true, true).show();
		}

		if (!isInWindow(bubble)) {
				theBubble.hide();
		}
	}

	/**
	 * mouseleave callback.
	 *
	 * @param {jQuery} theBubble The bubble that is being hovered.
	 */
	const mouseLeaveCallback = function( theBubble ) {
		if (o.bubbleAnimationOut === 'fadeout') {
			theBubble.stop(true, true).fadeOut();
		} else {
			// Delay hiding to make it possible to hover the bubble before it disappears
			theBubble.stop(true, true).delay(700).hide(0);
		}
	}

	/*
	 * This event will be triggered when user clicks on bubble
	 */
	const handleClickBubble = function (source, theBubble) {
		// When the wrapper is already visible (and the bubble is active), then remove the wrapper and the bubble's class
		if (theBubble.hasClass(classBubbleActive)) {
			removeCommentsWrapper(true);
			theBubble.removeClass(classBubbleActive);
		} else {
			// Remove classActive before classActive will be added to another element (source)
			removeExistingClasses(classActive);

			// Add classActive to active elements (paragraphs, divs, etc.)
			source.addClass(classActive);

			// Before creating a new comments wrapper: remove the previously created wrapper, if any
			removeCommentsWrapper();

			theBubble.addClass(classBubbleActive);
			loadCommentsWrapper(theBubble);
		}
	};

	/*
	 * Create comments wrapper
	 */
	const createCommentsWrapper = function () {
		let $commentsWrapper;

		if ($(classCommentsWrapperDot).length === 0) {
			$commentsWrapper = $(
				'<div/>',
				{ 'class': classCommentsWrapper }
			)
				.appendTo(idWrapperHash)
				.css('background-color', 'rgba(' + convertHexToRgb(o.background) + ',' + o.backgroundOpacity + ')');
		} else {
			$commentsWrapper = $(classCommentsWrapperDot);
		}

		return $commentsWrapper;
	};

	/*
	 * Load comments wrapper
	 */
	const loadCommentsWrapper = function (source) {
		const $commentsWrapper = createCommentsWrapper();

		loadCommentForm();
		setCommentsWrapperPosition(source, $commentsWrapper);
		loadComments();
		testIfMoveSiteIsNecessary($commentsWrapper);
		handleClickElsewhere();
		ajaxStop();
	};

	/*
	 * Use ajaxStop function to prevent plugin from breaking when another plugin uses Ajax
	 */
	const ajaxStop = function () {
		$(document).ready(handleClickCancel()).ajaxStop(function () {
			handleClickCancel();
		});
	};

	/*
	 * Insert comments and comment form into wrapper
	 */
	const loadCommentForm = function () {
		$(idCommentsAndFormHash).appendTo(classCommentsWrapperDot).show();
		$(classCommentsWrapperDot).find('li.comment').show();
		loadHiddenInputField();
	};

	/*
	 * Add a hidden input field dynamically
	 */
	const loadHiddenInputField = function () {
			const input = $('<input>')
				.attr('type', 'hidden')
				.attr('name', dataIncomKey).val(getAttDataIncomValue);
			$(idCommentsAndFormHash + ' .form-submit').append($(input));
	};

	/*
	 * Insert comments that have a specific value (getAttDataIncomValue) for attDataIncomComment
	 */
	const loadComments = function () {
		const flyoutComments = document.querySelectorAll( idWrapperHash + ' li.comment' );
		const fcArray = Array.from( flyoutComments );

		fcArray.forEach( function( comment ) {
			if ( comment.getAttribute( attDataIncomComment ) !== getAttDataIncomValue() ) {
				$(comment).hide();
			} else {
				$(comment).show();
			}
		} )

		$(classVisibleCommentDot + ' .children li').show();
	};

	/*
	 * Get (current) value for AttDataIncom
	 */
	const getAttDataIncomValue = function () {
		const $attDataIncomValue = $(classActiveDot).attr(attDataIncom);
		return $attDataIncomValue;
	};

	/**
	 * Set comment wrapper position.
	 *
	 * @param {jQuery} source  The source element.
	 * @param {jQuery} element The element to position.
	 */
	const setCommentsWrapperPosition = function (source, element) {
		const $offset = source.offset();

		/**
		 * Right-positioned elements should not spill over the viewport.
		 */
		const wrapperTotalWidth = element.outerWidth() + parseInt( element.css( 'margin-left' ) ) + parseInt( element.css( 'margin-right' ) );

		const calculateLeftOffset = () => {
			const naiveLeftOffset = $offset.left + source.outerWidth();

			const overflow = naiveLeftOffset + wrapperTotalWidth - window.innerWidth;

			// If it would overflow, put it to the left of the bubble.
			if ( overflow > 0 ) {
				const bubbleLeftOffset = $offset.left;

				// Ensure that the element doesn't overlap the bubble.
				element.width( element.width() - 20 );

				return bubbleLeftOffset - element.outerWidth();
			}

			return naiveLeftOffset;
		}

		const leftOffset = calculateLeftOffset();

		const verticalOffsetFromBubble = -16;

		element.css({
			'top': $offset.top + verticalOffsetFromBubble,
			'left': testIfPositionRight() ? leftOffset : $offset.left - element.outerWidth(),
		});

		if ( testIfPositionRight() ) {
			if ( leftOffset < source.offset().left ) {
				element.addClass( 'incom-has-right-bubble' );
				source.addClass( 'incom-is-right-bubble' );
			} else {
				element.removeClass( 'incom-has-right-bubble' );
				source.removeClass( 'incom-is-right-bubble' );
			}
		}
	}

	/*
	 * Set bubble position
	 */
	const setBubblePosition = function (source, element) {
		const $offset = source.offset();

		const scrollbarWidth = getScrollbarWidth();
		const buttonHorizontalMargin = 10;

		/**
		 * If right-positioned elements will be too close to the edge of the viewport
		 * (as on mobile devices), we should nudge them over to the left.
		 */
		const bubbleTotalWidth = element.outerWidth() + parseInt( element.css( 'margin-left' ) ) + parseInt( element.css( 'margin-right' ) );

		const calculateScrollbarOffset = () => {
			if ( ! testIfPositionRight() ) {
				return 0;
			}

			const availableSpace = window.innerWidth - scrollbarWidth;

			const overflow = $offset.left + source.outerWidth() + bubbleTotalWidth + buttonHorizontalMargin - availableSpace;

			if ( overflow > 0 ) {
				return overflow;
			}

			return 0;
		}

		const scrollbarOffset = calculateScrollbarOffset();

		/*
		 * Right-aligned bubbles should be placed off of the right edge,
		 * to allow room for scrollbars on mobile.
		 */
		const leftOffset = scrollbarOffset > 0 ? $offset.left + source.outerWidth() - scrollbarOffset : $offset.left + source.outerWidth();

		element.css({
			'top': $offset.top,
			'left': testIfPositionRight() ? leftOffset : $offset.left - element.outerWidth(),
		});

		if ( testIfPositionRight() ) {
			element.css( 'margin-right', buttonHorizontalMargin );
		} else {
			element.css( 'margin-left', buttonHorizontalMargin );
		}


		/*
		 * The scrollbarWidth offset means we will try to shrink the main content area
		 * by the same amount, to prevent overlap.
		 */
		if ( ! source.data( 'incom-scrollbar-offset' ) ) {
			const sourcePaddingRight = parseInt( source.css( 'padding-right' ) );
			if ( scrollbarOffset > 0 ) {
				source.css( 'padding-right', sourcePaddingRight + scrollbarOffset );
				source.data( 'incom-scrollbar-offset', scrollbarOffset );
			}
		}
	};

	const debug = function( message ) {
		const debugElement = document.getElementById( 'incom-debug' );
		if ( debugElement ) {
			debugElement.remove();
		}

		const newElement = document.createElement( 'div' );
		newElement.id = 'incom-debug';

		// If the message is an object, we'll stringify it.
		const stringifyMessage = ( theMessage ) => {
			if ( typeof theMessage === 'object' ) {
				return JSON.stringify( theMessage );
			}

			// DOM element
			if ( theMessage instanceof HTMLElement ) {
				return theMessage.outerHTML;
			}

			return theMessage;
		}

		const stringifiedMessage = stringifyMessage( message );
		newElement.textContent = stringifiedMessage;

		// fixed positioning
		newElement.style.position = 'fixed';

		// top right corner
		newElement.style.top = '0';
		newElement.style.right = '0';

		// z-index
		newElement.style.zIndex = '999999999';

		// padding
		newElement.style.padding = '10px';

		// allow all lines to wrap
		newElement.style.wordBreak = 'break-all';

		// background
		newElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';

		// append to body
		setTimeout( function() {
			document.body.appendChild( newElement );

			setTimeout( function() {
				newElement.remove();
			}, 8000 );
		}, 500 )
	}

	/*
	 * Set element properties (outerWidth, offset, ...)
	 */
	const setElementProperties = function (element) {
		$elementW = element.outerWidth();
		$offsetL = element.offset().left;
		$sumOffsetAndElementW = $offsetL + $elementW;
	};

	/*
	 * Test if element (bubble or so) is in window completely
	 */
	const isInWindow = function (element) {
		setElementProperties(element);
		return (($sumOffsetAndElementW > $viewportW) || ($offsetL < 0)) ? false : true;
	};

	const testIfMoveSiteIsNecessary = function (element) {
		setElementProperties(element);

		// If admin has selected position "right" and the comments wrapper's right side stands out of the screen -> setSlideWidth and moveSite
		if (testIfPositionRight() && ($sumOffsetAndElementW > $viewportW)) {
			setSlideWidth($sumOffsetAndElementW - $viewportW);
			moveSite('in');
		} else if (!testIfPositionRight() && ($offsetL < 0)) {
			setSlideWidth(-$offsetL);
			moveSite('in');
		}
	};

	const setSlideWidth = function (width) {
		slideWidth = width;
	};

	const getSlidewidth = function () {
		return slideWidth;
	};

	/*
	 * Remove comments wrapper when user clicks anywhere but the idWrapperHash
	 */
	const handleClickElsewhere = function () {
		let touchStartX = 0;
		let touchStartY = 0;
		let touchMoved = false;

		$('html').on('touchstart', function (e) {
			touchStartX = e.originalEvent.touches[0].clientX;
			touchStartY = e.originalEvent.touches[0].clientY;
			touchMoved = false;
		});

		$('html').on('touchmove', function (e) {
			const touchEndX = e.originalEvent.touches[0].clientX;
			const touchEndY = e.originalEvent.touches[0].clientY;

			// Detect significant movement
			if (Math.abs(touchEndX - touchStartX) > 10 || Math.abs(touchEndY - touchStartY) > 10) {
				touchMoved = true;
			}
		});

		$('html').on('touchend click', function (e) {
			// If the touch interaction involved movement, it's likely a scroll
			if (touchMoved) {
				return;
			}

			if ($(e.target).parents(idWrapperHash).length === 0) {
				removeCommentsWrapper(true);
			}
		});
	};

	/*
	 * Remove comments wrapper when user clicks on a cancel element
	 */
	const handleClickCancel = function () {
		$(classCancelDot).on( 'click', function (e) {
			e.preventDefault();
			removeCommentsWrapper(true);

			// If the last focused element is still in the DOM, set focus to it.
			if ( lastFocusedBubble ) {
				focusOnElement( lastFocusedBubble );
			}
		});
	};

	/*
	 * Remove comments wrapper
	 */
	const removeCommentsWrapper = function (fadeout) {
		const $classIncomBubble = $(classBubbleDot);
		const $classCommentsWrapper = $(classCommentsWrapperDot);

		// Comments and comment form must be detached (and hidden) before wrapper is deleted, so it can be used afterwards
		$(idCommentsAndFormHash).appendTo(idWrapperHash).hide();

		// Remove classVisibleComment from every element that has classVisibleComment
		$(classVisibleCommentDot).removeClass(classVisibleComment);

		// If any element with $classIncomBubble has classBubbleActive -> remove class and commentsWrapper
		if ($classIncomBubble.hasClass(classBubbleActive)) {
			$classIncomBubble.removeClass(classBubbleActive);
			if (fadeout) {
				$classCommentsWrapper.fadeOut('fast', function () {
					$(this).remove();
					removeExistingClasses(classActive);
				});
			} else {
				$classCommentsWrapper.remove();
			}
			moveSite('out');
		}
	};

	/**
	 * Focus on an element.
	 *
	 * This is a wrapper for focus() that also juggles the tabindex attribute.
	 *
	 * @param {HTMLElement} element The element to focus on.
	 */
	const focusOnElement = function( element ) {
		// Temporarily set tabindex to -1 so we can focus it.
		element.setAttribute( 'tabindex', '-1' );
		element.focus();

		// Remove tabindex so it can be tabbed to.
		element.addEventListener( 'blur', function() {
			element.removeAttribute( 'tabindex' );
		} )
	}

	const moveSite = function (way) {
		const $move = $(o.moveSiteSelector);
		$move.css({
			"position": "relative"
		});

		handleWayInAndOut($move, way);

		// Only move elements if o.moveSiteSelector is not the same as idWrapperAppendTo
		if (o.moveSiteSelector !== idWrapperAppendTo) {
			moveElement(way, classBubbleDot); // Move bubbles
			moveElement(way, classCommentsWrapperDot); // Move wrapper
		}
	};

	const handleWayInAndOut = function (element, way) {
		let value;

		if (way === 'in') {
			value = getSlidewidth();
		} else if (way === 'out') {
			value = 'initial';
		}
		moveLeftOrRight(element, value);
	};

	const moveLeftOrRight = function (element, value) {
		const direction = testIfPositionRight() ? 'right' : 'left';
		const options = {};
		options[direction] = value;

		element.css(options);

		// element.animate(options,{
		//    duration: 500,
		//           step:function(now, fn){
		//             fn.start = 0;
		//             fn.end = value;
		//             $(element).css({
		//                 '-webkit-transform':'translateX(-'+now+'px)',
		//                 '-moz-transform':'translateX(-'+now+'px)',
		//                 '-o-transform':'translateX(-'+now+'px)',
		//                 'transform':'translateX(-'+now+'px)'
		//             });
		//           }
		// });

		// if ( testIfPositionRight() ) {
		//   element.css( {
		//     '-webkit-transform': translateX(-100%);
		//     -moz-transform: translateX(-100%);
		//     -ms-transform: translateX(-100%);
		//     -o-transform: translateX(-100%);
		//     transform: translateX(-100%)

		//    } );
		// } else {
		//   element.css( { 'left' : value  } );
		// }



		// if ( testIfPositionRight() ) {
		//   // element.css( { 'right' : value  } );

		//   // element.animate({
		//   //   width: "toggle",
		//   //   height: "toggle"
		//   // }, {
		//   //   duration: 5000,
		//   //   specialEasing: {
		//   //     width: "linear",
		//   //     height: "easeOutBounce"
		//   //   },
		//   //   complete: function() {
		//   //     $( this ).after( "<div>Animation complete.</div>" );
		//   //   }
		//   // });
		//   element.animate({
		//       right: value,
		//     }, "fast" );

		// } else {
		//   element.css( { 'left' : value  } );
		// }
	};

	const moveElement = function (way, selector) {
		const $element = $(selector);

		if (way === 'in') {
			$element.css({
				left: testIfPositionRight() ? '-=' + getSlidewidth() : '+=' + getSlidewidth()
			});
		} else if (way === 'out') {
			$element.css({
				left: testIfPositionRight() ? '+=' + getSlidewidth() : '-=' + getSlidewidth()
			});
		}
	};

	const testIfPositionRight = function () {
		return o.position === 'right' ? true : false;
	};

	/*
	 * Controle references
	 * @since 2.1
	 */
	const references = function () {
		const source = attDataIncomRef;
		const target = attDataIncom;
		removeOutdatedReferences(source, target);
		loadScrollScript(source, target);
	};

	/*
	 * Remove outdated references that link to an element that doesn't exist
	 * @since 2.1
	 */
	const removeOutdatedReferences = function (source, target) {
		$('[' + source + ']').each(function () {
			const $source = $(this);
			const targetValue = $source.attr(source); // Get value from source element
			const $target = $('[' + target + '="' + targetValue + '"]');

			if (!$target.length) { // No length = linked element doesn't exist
				$source.parent().remove();
			}
		});
	};

	/*
	 * Define all event handler functions here
	 * @since 2.1.1
	 */
	const handleEvents = {
		init () {
			this.focusHandler();
			this.permalinksHandler();
			this.tabHandler();
			this.resizeHandler();
		},

		/**
		 * Focus handler.
		 *
		 * This is used to track the last focused element, so we can return focus to it
		 * when the user closes the comments.
		 */
		focusHandler() {
			const commentWrapper = document.getElementById( idWrapper );

			if ( commentWrapper ) {
				commentWrapper.addEventListener( 'focusin', function( e ) {
					if ( e.target.classList.contains( classBubbleLink ) ) {
						lastFocusedBubble = e.target;
					}
				} )
			}
		},

		permalinksHandler () {
			$(idCommentsAndFormHash).on('click', 'a.incom-permalink', function () {
				const $target = $(this.hash);

				if ($target.length) {
					animateScrolling($target);

					const href = $(this).attr("href");
					changeUrl(href);

					return false;
				}
			});
		},

		/**
		 * Adds show-bubbles class to #incom_wrapper when tab is used.
		 */
		tabHandler () {
			$(document).on( 'keydown', function( e ) {
				if ( 9 === e.keyCode ) {
					forceShowBubbles();
					addSkipLink();
				}
			});
		},

		/**
		 * Resize handler.
		 *
		 * Certain scroll events on mobile devices can improperly trigger the 'resize'
		 * event, so we use a width check to ensure that the resize is legitimate.
		 */
		resizeHandler () {
			let lastWindowWidth = window.innerWidth;

			const debounce = (func, wait) => {
				let timeout;
				return (...args) => {
					clearTimeout(timeout);
					timeout = setTimeout(() => func.apply(this, args), wait);
				};
			};

			const handleResize = () => {
				// Scrolling on mobile can trigger false positives.
				const currentWindowWidth = window.innerWidth;

				// Check if the dimensions have actually changed
				if ( currentWindowWidth !== lastWindowWidth ) {
					lastWindowWidth = currentWindowWidth;

					// This is a true resize, so we rebuild the comment bubbles.
					incom.rebuild();
				} else {
					// This is not a true resize.
				}
			};

			const debouncedResizeHandler = debounce(handleResize, 200);

			window.addEventListener('resize', debouncedResizeHandler);
		}
	};

	/*
	 * Load scroll script
	 * @since 2.1
	 *
	 * @todo When page scrolls to element, automatically open wrapper
	 */
	const loadScrollScript = function (source, target) {
		$('[' + source + ']').on( 'click', function ( e ) {
			const targetValue = $(this).attr(source); // Get value from source element
			const $target = $('[' + target + '="' + targetValue + '"]');

			if ($target.length) {
				animateScrolling($target);
				removeExistingClasses(classScrolledTo);
				$target.addClass(classScrolledTo);
			}

			// If this was a keyboard event, focus the bubble.
			if ( e.detail === 0 ) {
				const $bubble = $( '.incom-bubble[data-incom-bubble="' + targetValue + '"]');
				focusOnElement( $bubble[0] );
			}
		});
	};

	/*
	 * Remove existing classes (expects parameter "className" - without "dot")
	 */
	const removeExistingClasses = function (className) {
		const $activeE = $('.' + className);
		if ($activeE.length !== 0) {
			$activeE.removeClass(className);
			// If the attribute 'class' is empty -> remove it
			if ($activeE.prop('class').length === 0) {
				$activeE.removeAttr('class');
			}
		}
	};

	/*
	 * Create info element
	 */
	const createPluginInfo = function () {
		// source = Video
		const anchorElement = $('.incom-cancel-x');
		const element = $(loadPluginInfo());

		if ((o.displayBranding === true || o.displayBranding === 1) && !$(classBrandingDot).length) {
			anchorElement.after(element);
		}
	};

	/*
	 * Load plugin info
	 */
	const loadPluginInfo = function () {
		return '<a class="' + classBranding + '" href="http://kevinw.de/inline-comments/" title="Inline Comments by Kevin Weber" target="_blank">i</a>';
	};

	/*
	 * Private Helpers
	 */

	/*
	 * @return Hex colour value as RGB
	 */
	const convertHexToRgb = function (h) {
		const r = parseInt((removeHex(h)).substring(0, 2), 16);
		const g = parseInt((removeHex(h)).substring(2, 4), 16);
		const b = parseInt((removeHex(h)).substring(4, 6), 16);
		return r + ',' + g + ',' + b;
	};

	/*
	 * Remove Hex ("#") from string
	 */
	const removeHex = function (h) {
		return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
	};

	/*
	 * Set easing "quart"
	 */
	$.easing.quart = function (x, t, b, c, d) {
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	};

	/*
	 * Change URL
	 * @param href = complete URL
	 */
	const changeUrl = function (href) {
		const history = window.history || window.location;

		history.pushState(null, null, href);
		if ( history.pushState ) {
				history.pushState(null, null, href);
		} else {
				history.hash = href;
		}
	};

	/*
	 * Animate scrolling
	 * @param $target (expects unique jQuery object)
	 */
	const animateScrolling = function ($target) {
		const $scrollingRoot = $('html, body');
		const targetOffset = $target.offset().top - 30;

		$scrollingRoot.animate({
			scrollTop: targetOffset
		}, 1200, 'quart');
	};

	/**
	 * Show bubbles.
	 *
	 * This is currently done by adding a 'show-bubbles' class to the #incom_wrapper element.
	 */
	const forceShowBubbles = function() {
		document.getElementById( idWrapper ).classList.add( 'show-bubbles' );

		// We also have to loop through and show using jQuery, which adds inline styles.
		$( classBubbleDot ).show();
	}

	/**
	 * Add a 'skip to comments' link.
	 */
	const addSkipLink = function() {
		// Don't add the skip link if it already exists.
		if ( document.getElementById( 'incom-skip-to-comments' ) ) {
			return;
		}

		const newSkipLink = document.createElement( 'a' );
		newSkipLink.classList.add( 'skip-link' );
		newSkipLink.classList.add( 'screen-reader-text' );
		newSkipLink.href = idWrapperHash;
		newSkipLink.textContent = 'Skip to comments';
		newSkipLink.id = 'incom-skip-to-comments';

		const focusFirstBubble = function() {
			// Set focus (and tab navigation) to the first bubble.
			const firstBubble = document.querySelector( classBubbleDot );
			if ( firstBubble ) {
				focusOnElement( firstBubble );
			}

			const contentArea = findContentArea();
			if ( contentArea ) {
				// Calculate 100px offset above the content area.
				const offset = contentArea.offset().top - 100;

				window.scrollTo( {
					top: offset,
					behavior: 'smooth'
				} );
			}
		}

		// On enter, we should not scroll, but should set focus to the first incom bubble.
		newSkipLink.addEventListener( 'keydown', function( event ) {
			if ( event.key === 'Enter' || event.key === ' ') {
				focusFirstBubble();
				event.preventDefault();
			}
		} )

		newSkipLink.addEventListener( 'click', focusFirstBubble );

		const wpSkipLink = document.querySelector( 'a.skip-link' );
		if ( wpSkipLink ) {
			// Insert after the first skip link, if it exists.
			wpSkipLink.parentNode.insertBefore( newSkipLink, wpSkipLink.nextSibling );
		} else {
			// Otherwise insert at the top of the page.
			document.body.insertBefore( newSkipLink, document.body.firstChild );
		}
	}

	/**
	 * Adds data-incom-comment attributes to comments.
	 */
	const addIncomKeysToComments = function() {
		const { commentKeys } = window.incom

		// Index is the comment ID.
		for ( const commentId in commentKeys ) {
			const comment = document.getElementById( `comment-${commentId}` );

			if ( ! comment ) {
				continue;
			}

			// Bail if the comment already has a data-incom-comment attribute.
			if ( comment.dataset.incomComment ) {
				continue;
			}

			comment.dataset.incomComment = commentKeys[ commentId ];
		}
	}

	/**
	 * Get the width of the scrollbar.
	 *
	 * @return {number} The width of the scrollbar.
	 */
	const getScrollbarWidth = () => {
		// Create a temporary div element
		const div = document.createElement('div');

		// Apply styles to the div to ensure it has a scrollbar
		div.style.position = 'absolute';
		div.style.top = '-9999px';
		div.style.width = '100px';
		div.style.height = '100px';
		div.style.overflowY = 'scroll';

		// Append the div to the document body
		document.body.appendChild(div);

		// Calculate the scrollbar width
		const scrollbarWidth = div.offsetWidth - div.clientWidth;

		// Remove the temporary div from the document
		document.body.removeChild(div);

		// Return the scrollbar width
		return scrollbarWidth;
	}

	/*
	 * Public methods
	 */
	incom.init = function (options) {
		setOptions(options);

		addIncomKeysToComments();

		initIncomWrapper();

		createPluginInfo();
		references();

		// This code is required to make Inline Comments work with Ajaxify
		$(classReplyDot + " .comment-reply-link").on('click', function () {
			$(idCommentsAndFormHash + ' #commentform').attr("id", idCommentForm);
		});

		handleEvents.init();

		// If we detect that we're running on a mobile device (no hover), show bubbles by default.
		if ( 'ontouchstart' in window ) {
			forceShowBubbles();
		}
	};
}(window.incom = window.incom || {}, jQuery));
