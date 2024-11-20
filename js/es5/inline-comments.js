"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* global jQuery */

/*
 * Inline Comments
 * by Kevin Weber
 */

(function (incom, $) {
  'use strict';

  var o;
  var _wp$i18n = wp.i18n,
    sprintf = _wp$i18n.sprintf,
    __ = _wp$i18n.__;

  // IDs
  var idWrapper = 'incom_wrapper',
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
    classPosition = 'incom-position-',
    // Expects that o.position follows ('left' or 'right')
    classBubble = 'incom-bubble',
    classBubbleDot = '.' + classBubble,
    classBubbleStyle = classBubble + '-style',
    classBubbleStatic = classBubble + '-static',
    classBubbleStaticDot = '.' + classBubbleStatic,
    classBubbleDynamic = classBubble + '-dynamic',
    classBubbleActive = classBubble + '-active',
    // Class for currently selected bubble
    classBubbleLink = classBubble + '-link',
    classCommentsWrapper = 'incom-comments-wrapper',
    classCommentsWrapperDot = '.' + classCommentsWrapper,
    classReply = 'incom-reply',
    classReplyDot = '.' + classReply,
    classCancel = 'incom-cancel',
    // When a user clicks on an element with this class, the comments wrapper will be removed
    classCancelDot = '.' + classCancel,
    classBranding = 'incom-info-icon',
    classBrandingDot = '.' + classBranding,
    classScrolledTo = 'incom-scrolled-to',
    // Other
    dataIncomKey = 'data_incom',
    // Should be the same as $DataIncomKey in class-comments.php
    attDataIncomArr = []; // Array that contains all attDataIncom values

  var slideWidth = 0,
    // Shift page content o.moveSiteSelector to the left
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
    var commentsForm = $(idCommentsAndFormHash + ':visible');
    if (commentsForm.length) {
      removeCommentsWrapper();
      moveSite('out');
    }
  };

  /*
   * Private methods
   */
  var setOptions = function setOptions(options) {
    // 'options' overrides these defaults
    o = $.extend({
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
      displayBranding: false
    }, options);
  };

  /*
   * This wrapper contains comment bubbles
   */
  var initIncomWrapper = function initIncomWrapper() {
    var docFragment, wrapper, wrapperParent;
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
  var initElementsAndBubblesFromSelectors = function initElementsAndBubblesFromSelectors() {
    var $contentArea = findContentArea();
    var elementsBySelectors = $contentArea.find(o.selectors);
    var l = elementsBySelectors.length;
    for (var j = 0; j < l; j++) {
      var $that = $(elementsBySelectors[j]);
      addAttToElement($that);
      bubble.createFromElement($that);
    }
  };

  /**
   * Uses heuristics to identify the post content area.
   *
   * @return {jQuery} The content area.
   */
  var findContentArea = function findContentArea() {
    var $content = $('.entry-content');
    if ($content.length) {
      return $content;
    }
    var $main = $('main');
    if ($main.length && 1 === $main.length) {
      return $main;
    }
    return $('body');
  };

  /**
   * Add attribute attDataIncom to element; increase counter per element type (instead of using one counter for all elements independent of their types).
   *
   * @param {jQuery} $element The element to add the attribute to.
   */
  var addAttToElement = function addAttToElement($element) {
    var i = 0;

    // Only proceed if element has no attribute attDataIncom yet
    var elementDataIncomAttr = $element.data('incom');
    if (elementDataIncomAttr) {
      return;
    }
    var identifier = getIdentifier($element);

    // Increase i when specific attProp (value of attDataIncom) already exists
    i = increaseIdentifierNumberIfAttPropExists(i, identifier);
    var attProp = identifier + i; // WOULD BE BETTER: var attProp = identifier + '-' + i; // BUT THAT WOULD CONFLICT WITH ALREADY STORED COMMENTS

    //@TODO: Add part that assigns comment to specific article/page/post (article-id); include fallback in cause a comment has no ID (yet)

    $element.attr(attDataIncom, attProp);
    $element.attr('id', 'incom-element-' + attProp);
  };
  var bubble = {
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
    createFromElement: function createFromElement($element) {
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
  var getIdentifier = function getIdentifier(element) {
    var identifier = element.prop('tagName').substr(0, 5);
    return identifier;
  };

  /*
   * Increase identifier number (i) if that specific attProp was already used. attProp must be unique
   * @return int
   */
  var increaseIdentifierNumberIfAttPropExists = function increaseIdentifierNumberIfAttPropExists(i, identifier) {
    var attProp = identifier + i;
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
  var addBubble = function addBubble(source) {
    var bubbleText = addBubbleText(source);
    var bubbleContainer = loadBubbleContainer(source);
    var $bubble = $('<a/>', {
      href: '',
      'class': classBubbleLink
    }).text(bubbleText).wrap(bubbleContainer).parent().appendTo(idWrapperHash);
    setDisplayStatic($bubble);
    setBubblePosition(source, $bubble);
    if (!isInWindow($bubble)) {
      $bubble.hide();
    } else {
      handleHover(source, $bubble);
      $bubble.on('click', function (e) {
        e.preventDefault();
        var isKeyboardEvent = e.detail === 0;
        handleClickBubble(source, $bubble, isKeyboardEvent);

        // If this was a keyboard event, focus the first input field.
        if (isKeyboardEvent) {
          $(idCommentsAndFormHash + ' textarea').first().focus();
        }
      });
    }
  };

  /*
   * Get text/number that should be displayed in a bubble
   */
  var addBubbleText = function addBubbleText(source) {
    var bubbleText;
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
  var countComments = function countComments(source) {
    // Get attribute value from source's attribute attDataIncom
    var attFromSource = source.attr(attDataIncom);

    /*
     * Define selector that identifies elements that shall be counted.
     *
     * Only count those in the main comment thread, so we don't get double-counted.
     */
    var selectByAtt = idCommentsAndFormHash + ' [' + attDataIncomComment + '="' + attFromSource + '"]';

    // Count elements
    return $(selectByAtt).length;
  };

  /*
   * Get container that contains the bubble link
   */
  var loadBubbleContainer = function loadBubbleContainer(source) {
    var bubbleValue = source.attr(attDataIncom);
    var text = '<div class="' + loadBubbleContainerClass(source) + '" ' + attDataIncomBubble + '="' + bubbleValue + '" />';
    return text;
  };

  /*
   * Generate class for bubbleContainer
   */
  var loadBubbleContainerClass = function loadBubbleContainerClass(source) {
    var containerClass = classBubble;
    var space = ' ';
    if (o.alwaysStatic || testIfCommentsCountLarger0(source) && o.countStatic) {
      containerClass += space + classBubbleStatic;
    }
    if (testIfCommentsCountLarger0(source) || !testIfCommentsCountLarger0(source) && o.bubbleStyle === 'bubble') {
      containerClass += space + classBubbleStyle;
    } else {
      containerClass += space + classBubbleDynamic;
    }
    return containerClass;
  };

  /*
   * Test if comments count is larger than 0
   */
  var testIfCommentsCountLarger0 = function testIfCommentsCountLarger0(source) {
    var count = countComments(source);
    return isNumeric(count) && count > 0 ? true : false;
  };
  var setDisplayStatic = function setDisplayStatic(theBubble) {
    if (theBubble.hasClass(classBubbleStatic)) {
      theBubble.css('display', 'block');
    }
  };
  var isNumeric = function isNumeric(value) {
    return typeof value === 'number' && isFinite(value) || !isNaN(Number(value));
  };
  var hideBubbleTimer;
  var handleHover = function handleHover(element, theBubble) {
    if (!theBubble.hasClass(classBubbleStatic) && o.canComment) {
      element.add(theBubble);
      element.on('mouseenter', function () {
        mouseEnterCallback(theBubble);
      });
      element.on('mouseleave', function () {
        mouseLeaveCallback(theBubble);
      });

      // Also set mouseleave for the bubble itself
      theBubble.on('mouseleave', function () {
        mouseLeaveCallback(theBubble);
      });
      theBubble.on('mouseenter', function () {
        mouseEnterCallback(theBubble);
      });
    }
  };
  var mouseEnterCallback = function mouseEnterCallback(theBubble) {
    // Clear the hide timer if mouse re-enters within the debounce time
    clearTimeout(hideBubbleTimer);

    // Show the bubble
    $(classBubbleDot + ':not(' + classBubbleStaticDot + ')').hide();
    if (o.bubbleAnimationIn === 'fadein') {
      theBubble.stop(true, true).fadeIn();
    } else {
      theBubble.stop(true, true).show();
    }
    if (!isInWindow(bubble)) {
      theBubble.hide();
    }
  };
  var mouseLeaveCallback = function mouseLeaveCallback(theBubble) {
    // Set a debounce timer to hide the bubble after 2 seconds
    hideBubbleTimer = setTimeout(function () {
      if ($(idCommentsAndFormHash).is(':visible')) {
        return;
      }
      if (o.bubbleAnimationOut === 'fadeout') {
        theBubble.stop(true, true).fadeOut();
      } else {
        theBubble.stop(true, true).hide();
      }
    }, 2000);
  };

  /*
   * This event will be triggered when user clicks on bubble
   */
  var handleClickBubble = function handleClickBubble(source, theBubble) {
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
  var createCommentsWrapper = function createCommentsWrapper() {
    var $commentsWrapper;
    if ($(classCommentsWrapperDot).length === 0) {
      $commentsWrapper = $('<div/>', {
        'class': classCommentsWrapper
      }).appendTo(idWrapperHash);
    } else {
      $commentsWrapper = $(classCommentsWrapperDot);
    }
    return $commentsWrapper;
  };

  /*
   * Load comments wrapper
   */
  var loadCommentsWrapper = function loadCommentsWrapper(source) {
    var $commentsWrapper = createCommentsWrapper();
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
  var ajaxStop = function ajaxStop() {
    $(document).ready(handleClickCancel()).ajaxStop(function () {
      handleClickCancel();
    });
  };

  /*
   * Insert comments and comment form into wrapper
   */
  var loadCommentForm = function loadCommentForm() {
    $(idCommentsAndFormHash).appendTo(classCommentsWrapperDot).show();
    $(classCommentsWrapperDot).find('li.comment').show();
    loadHiddenInputField();
  };

  /*
   * Add a hidden input field dynamically
   */
  var loadHiddenInputField = function loadHiddenInputField() {
    var input = $('<input>').attr('type', 'hidden').attr('name', dataIncomKey).val(getAttDataIncomValue);
    $(idCommentsAndFormHash + ' .form-submit').append($(input));
  };

  /*
   * Insert comments that have a specific value (getAttDataIncomValue) for attDataIncomComment
   */
  var loadComments = function loadComments() {
    var flyoutComments = document.querySelectorAll(idWrapperHash + ' li.comment');
    var fcArray = Array.from(flyoutComments);
    fcArray.forEach(function (comment) {
      if (comment.getAttribute(attDataIncomComment) !== getAttDataIncomValue()) {
        $(comment).hide();
      } else {
        $(comment).show();
      }
    });
    $(classVisibleCommentDot + ' .children li').show();
    collapseAllReplies();
  };

  /**
   * Collapse all replies for top-level comments.
   */
  var collapseAllReplies = function collapseAllReplies() {
    var $topLevelComments = $(idCommentsAndFormHash + ' > .comment');
    $topLevelComments.each(function () {
      collapseCommentReplies($(this));
    });
  };

  /**
   * Collapses the replies section for a top-level comment.
   *
   * @param {jQuery} $comment The top-level comment.
   */
  var collapseCommentReplies = function collapseCommentReplies($comment) {
    var $repliesContainer = $comment.children('.children');
    if (!$repliesContainer.length) {
      return;
    }

    // Count replies. No need to recurse since it's all in the DOM.
    var replyCount = $repliesContainer.find('li').length;
    $comment.data('incom-reply-count', replyCount);
    toggleReplies($comment, 'collapsed');
    $comment.find('.incom-showhide-replies button').on('click', function (event) {
      event.preventDefault();
      toggleReplies($comment);
    });
  };

  /**
   * Toggle replies for a top-level comment.
   *
   * @param {jQuery} $comment    The top-level comment.
   * @param {string} targetState The target state for the replies. If null, the state will be toggled.
   */
  var toggleReplies = function toggleReplies($comment) {
    var targetState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (null === targetState) {
      targetState = $comment.hasClass('incom-replies-collapsed') ? 'expanded' : 'collapsed';
    }
    var linkTextFormat;
    if ('expanded' === targetState) {
      // translators: %s: number of replies
      linkTextFormat = __('Hide Replies (%s)', 'inline-comments');
      $comment.removeClass('incom-replies-collapsed').addClass('incom-replies-expanded');
    } else {
      // translators: %s: number of replies
      linkTextFormat = __('Show Replies (%s)', 'inline-comments');
      $comment.removeClass('incom-replies-expanded').addClass('incom-replies-collapsed');
    }
    var replyCount = $comment.data('incom-reply-count');
    var linkText = sprintf(linkTextFormat, replyCount);
    $comment.find('.incom-showhide-replies button').html(linkText);
  };

  /*
   * Get (current) value for AttDataIncom
   */
  var getAttDataIncomValue = function getAttDataIncomValue() {
    var $attDataIncomValue = $(classActiveDot).attr(attDataIncom);
    return $attDataIncomValue;
  };

  /**
   * Set comment wrapper position.
   *
   * @param {jQuery} source  The source element.
   * @param {jQuery} element The element to position.
   */
  var setCommentsWrapperPosition = function setCommentsWrapperPosition(source, element) {
    var $offset = source.offset();

    /**
     * Right-positioned elements should not spill over the viewport.
     */
    var wrapperTotalWidth = element.outerWidth() + parseInt(element.css('margin-left')) + parseInt(element.css('margin-right'));
    var calculateLeftOffset = function calculateLeftOffset() {
      var naiveLeftOffset = $offset.left + source.outerWidth();
      var overflow = naiveLeftOffset + wrapperTotalWidth - window.innerWidth;

      // If it would overflow, put it to the left of the bubble.
      if (overflow > 0) {
        var bubbleLeftOffset = $offset.left;

        // Ensure that the element doesn't overlap the bubble.
        element.width(element.width() - 20);
        return bubbleLeftOffset - element.outerWidth();
      }
      return naiveLeftOffset;
    };
    var leftOffset = calculateLeftOffset();
    var verticalOffsetFromBubble = -16;
    element.css({
      'top': $offset.top + verticalOffsetFromBubble,
      'left': testIfPositionRight() ? leftOffset : $offset.left - element.outerWidth()
    });
    if (testIfPositionRight()) {
      if (leftOffset < source.offset().left) {
        element.addClass('incom-has-right-bubble');
        source.addClass('incom-is-right-bubble');
      } else {
        element.removeClass('incom-has-right-bubble');
        source.removeClass('incom-is-right-bubble');
      }
    }
  };

  /*
   * Set bubble position
   */
  var setBubblePosition = function setBubblePosition(source, element) {
    var $offset = source.offset();
    var scrollbarWidth = getScrollbarWidth();
    var buttonHorizontalMargin = 10;

    /**
     * If right-positioned elements will be too close to the edge of the viewport
     * (as on mobile devices), we should nudge them over to the left.
     */
    var bubbleTotalWidth = element.outerWidth() + parseInt(element.css('margin-left')) + parseInt(element.css('margin-right'));
    var calculateScrollbarOffset = function calculateScrollbarOffset() {
      if (!testIfPositionRight()) {
        return 0;
      }
      var availableSpace = window.innerWidth - scrollbarWidth;
      var overflow = $offset.left + source.outerWidth() + bubbleTotalWidth + buttonHorizontalMargin - availableSpace;
      if (overflow > 0) {
        return overflow;
      }
      return 0;
    };
    var scrollbarOffset = calculateScrollbarOffset();

    /*
     * Right-aligned bubbles should be placed off of the right edge,
     * to allow room for scrollbars on mobile.
     */
    var leftOffset = scrollbarOffset > 0 ? $offset.left + source.outerWidth() - scrollbarOffset : $offset.left + source.outerWidth();
    element.css({
      'top': $offset.top,
      'left': testIfPositionRight() ? leftOffset : $offset.left - element.outerWidth()
    });
    if (testIfPositionRight()) {
      element.css('margin-right', buttonHorizontalMargin);
    } else {
      element.css('margin-left', buttonHorizontalMargin);
    }

    /*
     * The scrollbarWidth offset means we will try to shrink the main content area
     * by the same amount, to prevent overlap.
     */
    if (!source.data('incom-scrollbar-offset')) {
      var sourcePaddingRight = parseInt(source.css('padding-right'));
      if (scrollbarOffset > 0) {
        source.css('padding-right', sourcePaddingRight + scrollbarOffset);
        source.data('incom-scrollbar-offset', scrollbarOffset);
      }
    }
  };
  var debug = function debug(message) {
    var debugElement = document.getElementById('incom-debug');
    if (debugElement) {
      debugElement.remove();
    }
    var newElement = document.createElement('div');
    newElement.id = 'incom-debug';

    // If the message is an object, we'll stringify it.
    var stringifyMessage = function stringifyMessage(theMessage) {
      if (_typeof(theMessage) === 'object') {
        return JSON.stringify(theMessage);
      }

      // DOM element
      if (theMessage instanceof HTMLElement) {
        return theMessage.outerHTML;
      }
      return theMessage;
    };
    var stringifiedMessage = stringifyMessage(message);
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
    setTimeout(function () {
      document.body.appendChild(newElement);
      setTimeout(function () {
        newElement.remove();
      }, 8000);
    }, 500);
  };

  /*
   * Set element properties (outerWidth, offset, ...)
   */
  var setElementProperties = function setElementProperties(element) {
    $elementW = element.outerWidth();
    $offsetL = element.offset().left;
    $sumOffsetAndElementW = $offsetL + $elementW;
  };

  /*
   * Test if element (bubble or so) is in window completely
   */
  var isInWindow = function isInWindow(element) {
    setElementProperties(element);
    return $sumOffsetAndElementW > $viewportW || $offsetL < 0 ? false : true;
  };
  var testIfMoveSiteIsNecessary = function testIfMoveSiteIsNecessary(element) {
    setElementProperties(element);

    // If admin has selected position "right" and the comments wrapper's right side stands out of the screen -> setSlideWidth and moveSite
    if (testIfPositionRight() && $sumOffsetAndElementW > $viewportW) {
      setSlideWidth($sumOffsetAndElementW - $viewportW);
      moveSite('in');
    } else if (!testIfPositionRight() && $offsetL < 0) {
      setSlideWidth(-$offsetL);
      moveSite('in');
    }
  };
  var setSlideWidth = function setSlideWidth(width) {
    slideWidth = width;
  };
  var getSlidewidth = function getSlidewidth() {
    return slideWidth;
  };

  /*
   * Remove comments wrapper when user clicks anywhere but the idWrapperHash
   */
  var handleClickElsewhere = function handleClickElsewhere() {
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMoved = false;
    $('html').on('touchstart', function (e) {
      touchStartX = e.originalEvent.touches[0].clientX;
      touchStartY = e.originalEvent.touches[0].clientY;
      touchMoved = false;
    });
    $('html').on('touchmove', function (e) {
      var touchEndX = e.originalEvent.touches[0].clientX;
      var touchEndY = e.originalEvent.touches[0].clientY;

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
      var isClickInsideWrapper = $(e.target).closest(idWrapperHash).length > 0;
      var isClickOnReference = $(e.target).closest('[' + attDataIncomRef + ']').length > 0;
      if (!isClickInsideWrapper && !isClickOnReference) {
        removeCommentsWrapper(true);
      }
    });
  };

  /*
   * Remove comments wrapper when user clicks on a cancel element
   */
  var handleClickCancel = function handleClickCancel() {
    $(classCancelDot).on('click', function (e) {
      e.preventDefault();
      removeCommentsWrapper(true);

      // If the last focused element is still in the DOM, set focus to it.
      if (lastFocusedBubble) {
        focusOnElement(lastFocusedBubble);
      }
    });
  };

  /*
   * Remove comments wrapper
   */
  var removeCommentsWrapper = function removeCommentsWrapper(fadeout) {
    var $classIncomBubble = $(classBubbleDot);
    var $classCommentsWrapper = $(classCommentsWrapperDot);

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
  var focusOnElement = function focusOnElement(element) {
    // Temporarily set tabindex to -1 so we can focus it.
    element.setAttribute('tabindex', '-1');
    element.focus();

    // Remove tabindex so it can be tabbed to.
    element.addEventListener('blur', function () {
      element.removeAttribute('tabindex');
    });
  };
  var moveSite = function moveSite(way) {
    var $move = $(o.moveSiteSelector);
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
  var handleWayInAndOut = function handleWayInAndOut(element, way) {
    var value;
    if (way === 'in') {
      value = getSlidewidth();
    } else if (way === 'out') {
      value = 'initial';
    }
    moveLeftOrRight(element, value);
  };
  var moveLeftOrRight = function moveLeftOrRight(element, value) {
    var direction = testIfPositionRight() ? 'right' : 'left';
    var options = {};
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
  var moveElement = function moveElement(way, selector) {
    var $element = $(selector);
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
  var testIfPositionRight = function testIfPositionRight() {
    return o.position === 'right' ? true : false;
  };

  /*
   * Controle references
   * @since 2.1
   */
  var references = function references() {
    var source = attDataIncomRef;
    var target = attDataIncom;
    removeOutdatedReferences(source, target);
    loadScrollScript(source, target);
  };

  /*
   * Remove outdated references that link to an element that doesn't exist
   * @since 2.1
   */
  var removeOutdatedReferences = function removeOutdatedReferences(source, target) {
    $('[' + source + ']').each(function () {
      var $source = $(this);
      var targetValue = $source.attr(source); // Get value from source element
      var $target = $('[' + target + '="' + targetValue + '"]');
      if (!$target.length) {
        // No length = linked element doesn't exist
        $source.parent().remove();
      }
    });
  };

  /*
   * Define all event handler functions here
   * @since 2.1.1
   */
  var handleEvents = {
    init: function init() {
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
    focusHandler: function focusHandler() {
      var commentWrapper = document.getElementById(idWrapper);
      if (commentWrapper) {
        commentWrapper.addEventListener('focusin', function (e) {
          if (e.target.classList.contains(classBubbleLink)) {
            lastFocusedBubble = e.target;
          }
        });
      }
    },
    permalinksHandler: function permalinksHandler() {
      $(idCommentsAndFormHash).on('click', 'a.incom-permalink', function () {
        var $target = $(this.hash);
        if ($target.length) {
          animateScrolling($target);
          var href = $(this).attr("href");
          changeUrl(href);
          return false;
        }
      });
    },
    /**
     * Adds show-bubbles class to #incom_wrapper when tab is used.
     */
    tabHandler: function tabHandler() {
      $(document).on('keydown', function (e) {
        if (9 === e.keyCode) {
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
    resizeHandler: function resizeHandler() {
      var _this = this;
      var lastWindowWidth = window.innerWidth;
      var debounce = function debounce(func, wait) {
        var timeout;
        return function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            return func.apply(_this, args);
          }, wait);
        };
      };
      var handleResize = function handleResize() {
        // Scrolling on mobile can trigger false positives.
        var currentWindowWidth = window.innerWidth;

        // Check if the dimensions have actually changed
        if (currentWindowWidth !== lastWindowWidth) {
          lastWindowWidth = currentWindowWidth;

          // This is a true resize, so we rebuild the comment bubbles.
          incom.rebuild();
        } else {
          // This is not a true resize.
        }
      };
      var debouncedResizeHandler = debounce(handleResize, 200);
      window.addEventListener('resize', debouncedResizeHandler);
    }
  };

  /*
   * Load scroll script
   * @since 2.1
   *
   * @todo When page scrolls to element, automatically open wrapper
   */
  var loadScrollScript = function loadScrollScript(source, target) {
    $('[' + source + ']').on('click', function (e) {
      var targetValue = $(this).attr(source); // Get value from source element
      var $target = $('[' + target + '="' + targetValue + '"]');
      if ($target.length) {
        animateScrolling($target);
        removeExistingClasses(classScrolledTo);
        $target.addClass(classScrolledTo);
      }
      var $bubble = $('.incom-bubble[data-incom-bubble="' + targetValue + '"]');

      // If this was a keyboard event, focus the bubble.
      if (e.detail === 0) {
        focusOnElement($bubble[0]);
      }
      if (!$bubble.hasClass(classBubbleActive)) {
        handleClickBubble($target, $bubble);
      }
    });
  };

  /*
   * Remove existing classes (expects parameter "className" - without "dot")
   */
  var removeExistingClasses = function removeExistingClasses(className) {
    var $activeE = $('.' + className);
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
  var createPluginInfo = function createPluginInfo() {
    // source = Video
    var anchorElement = $('.incom-cancel-x');
    var element = $(loadPluginInfo());
    if ((o.displayBranding === true || o.displayBranding === 1) && !$(classBrandingDot).length) {
      anchorElement.after(element);
    }
  };

  /*
   * Load plugin info
   */
  var loadPluginInfo = function loadPluginInfo() {
    return '<a class="' + classBranding + '" href="http://kevinw.de/inline-comments/" title="Inline Comments by Kevin Weber" target="_blank">i</a>';
  };

  /*
   * Private Helpers
   */

  /*
   * @return Hex colour value as RGB
   */
  var convertHexToRgb = function convertHexToRgb(h) {
    var r = parseInt(removeHex(h).substring(0, 2), 16);
    var g = parseInt(removeHex(h).substring(2, 4), 16);
    var b = parseInt(removeHex(h).substring(4, 6), 16);
    return r + ',' + g + ',' + b;
  };

  /*
   * Remove Hex ("#") from string
   */
  var removeHex = function removeHex(h) {
    return h.charAt(0) === "#" ? h.substring(1, 7) : h;
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
  var changeUrl = function changeUrl(href) {
    var history = window.history || window.location;
    history.pushState(null, null, href);
    if (history.pushState) {
      history.pushState(null, null, href);
    } else {
      history.hash = href;
    }
  };

  /*
   * Animate scrolling
   * @param $target (expects unique jQuery object)
   */
  var animateScrolling = function animateScrolling($target) {
    var $scrollingRoot = $('html, body');
    var targetOffset = $target.offset().top - 30;
    $scrollingRoot.animate({
      scrollTop: targetOffset
    }, 1200, 'quart');
  };

  /**
   * Show bubbles.
   *
   * This is currently done by adding a 'show-bubbles' class to the #incom_wrapper element.
   */
  var forceShowBubbles = function forceShowBubbles() {
    document.getElementById(idWrapper).classList.add('show-bubbles');

    // We also have to loop through and show using jQuery, which adds inline styles.
    $(classBubbleDot).show();
  };

  /**
   * Add a 'skip to comments' link.
   */
  var addSkipLink = function addSkipLink() {
    // Don't add the skip link if it already exists.
    if (document.getElementById('incom-skip-to-comments')) {
      return;
    }
    var newSkipLink = document.createElement('a');
    newSkipLink.classList.add('skip-link');
    newSkipLink.classList.add('screen-reader-text');
    newSkipLink.href = idWrapperHash;
    newSkipLink.textContent = 'Skip to comments';
    newSkipLink.id = 'incom-skip-to-comments';
    var focusFirstBubble = function focusFirstBubble() {
      // Set focus (and tab navigation) to the first bubble.
      var firstBubble = document.querySelector(classBubbleDot);
      if (firstBubble) {
        focusOnElement(firstBubble);
      }
      var contentArea = findContentArea();
      if (contentArea) {
        // Calculate 100px offset above the content area.
        var offset = contentArea.offset().top - 100;
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    };

    // On enter, we should not scroll, but should set focus to the first incom bubble.
    newSkipLink.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        focusFirstBubble();
        event.preventDefault();
      }
    });
    newSkipLink.addEventListener('click', focusFirstBubble);
    var wpSkipLink = document.querySelector('a.skip-link');
    if (wpSkipLink) {
      // Insert after the first skip link, if it exists.
      wpSkipLink.parentNode.insertBefore(newSkipLink, wpSkipLink.nextSibling);
    } else {
      // Otherwise insert at the top of the page.
      document.body.insertBefore(newSkipLink, document.body.firstChild);
    }
  };

  /**
   * Adds data-incom-comment attributes to comments.
   */
  var addIncomKeysToComments = function addIncomKeysToComments() {
    var commentKeys = window.incom.commentKeys;

    // Index is the comment ID.
    for (var commentId in commentKeys) {
      var comment = document.getElementById("comment-".concat(commentId));
      if (!comment) {
        continue;
      }

      // Bail if the comment already has a data-incom-comment attribute.
      if (comment.dataset.incomComment) {
        continue;
      }
      comment.dataset.incomComment = commentKeys[commentId];
    }
  };

  /**
   * Get the width of the scrollbar.
   *
   * @return {number} The width of the scrollbar.
   */
  var getScrollbarWidth = function getScrollbarWidth() {
    // Create a temporary div element
    var div = document.createElement('div');

    // Apply styles to the div to ensure it has a scrollbar
    div.style.position = 'absolute';
    div.style.top = '-9999px';
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflowY = 'scroll';

    // Append the div to the document body
    document.body.appendChild(div);

    // Calculate the scrollbar width
    var scrollbarWidth = div.offsetWidth - div.clientWidth;

    // Remove the temporary div from the document
    document.body.removeChild(div);

    // Return the scrollbar width
    return scrollbarWidth;
  };

  /**
   * Mark the comment that is currently being replied to.
   *
   * @param {jQuery} $comment The comment that is being replied to.
   */
  var markCurrentCommentBeingRepliedTo = function markCurrentCommentBeingRepliedTo($comment) {
    // Remove existing markers.
    $('.comment').removeClass('incom-replying-to');
    $('.children').removeClass('incom-replying-to-children');
    $comment.addClass('incom-replying-to');
    $comment.closest('.children').addClass('incom-replying-to-children');
  };

  /**
   * Move the comment form to the current comment being replied to.
   *
   * This mimics the comment-reply-link behavior in WP themes.
   *
   * @param {jQuery} $repliedToComment The comment that is being replied to.
   */
  var moveCommentFormToComment = function moveCommentFormToComment($repliedToComment) {
    var $commentFormDiv = $('#incom-respond');

    // Make sure the comment submit button says 'Post reply'.
    $commentFormDiv.find('.submit').val(__('Post reply', 'inline-comments'));
    $commentFormDiv.appendTo($repliedToComment);
  };

  /**
   * Adds the Cancel link to the reply form.
   *
   * This mimics the comment-reply-link behavior in WP themes. When replying to a comment,
   * Cancel moves the reply form back to the bottom of the comments. When the form is
   * in its original position, the link is hidden with CSS.
   */
  var addCancelLinkToReplyForm = function addCancelLinkToReplyForm() {
    var $commentForm = $('#incom-respond');
    if (!$commentForm.length) {
      return;
    }
    var $cancelLink = $('<a class="incom-cancel-reply-link" href="#">' + __('Cancel', 'inline-comments') + '</a>');
    $cancelLink.on('click', function (event) {
      event.preventDefault();

      // Make sure the comment submit button says 'Post comment'.
      $commentForm.find('.submit').val(__('Post comment', 'inline-comments'));
      $commentForm.appendTo(idCommentsAndFormHash);
    });
    $('.incom-form-submit').append($cancelLink);
  };

  /*
   * Public methods
   */
  incom.init = function (options) {
    setOptions(options);
    addIncomKeysToComments();
    initIncomWrapper();
    createPluginInfo();
    references();
    addCancelLinkToReplyForm();
    $(classReplyDot + " .incom-reply-link").on('click', function (event) {
      event.preventDefault();

      // This code is required to make Inline Comments work with Ajaxify
      $(idCommentsAndFormHash + ' #commentform').attr("id", idCommentForm);
      var $repliedToComment = $(event.target.closest('.comment'));
      markCurrentCommentBeingRepliedTo($repliedToComment);
      moveCommentFormToComment($repliedToComment);
    });
    handleEvents.init();

    // If we detect that we're running on a mobile device (no hover), show bubbles by default.
    if ('ontouchstart' in window) {
      forceShowBubbles();
    }
  };
})(window.incom = window.incom || {}, jQuery);
