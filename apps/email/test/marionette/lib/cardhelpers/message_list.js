var baseCardMagic = require('./base_card_magic');

function MessageListHelper() {
}
MessageListHelper.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  //

  //////////////////////////////////////////////////////////////////////////////
  // Scrolling, Visibility

  /**
   * Scrolls so the first message in the list is at the top of the scroll area,
   * avoiding scrolling the search box into view.
   */
  scrollToTopMessage: function() {
  },

  /**
   * Scrolls so the last message in the list is at the bottom of the scroll
   * area.
   */
  scrollToBottomMessage: function() {
  },

  /**
   * Scroll so that the given message is fully visible
   */
  scrollMessageIntoView: function(message) {
  },

  /**
   * The message should be fully visible, error if not.
   *
   * This method is not stateful and does not care if wacky DOM node recyling
   * has gone on; it gets the fully visible messages and checks if any of them
   * are our message.
   */
  assertMessageVisible: function() {
  },

  /**
   * The message should not be visible, error if it is.
   *
   * This method is not stateful and does not care if wacky DOM node recyling
   * has gone on; it gets the fully visible messages and checks if any of them
   * are our message.
   */
  assertMessageNotVisible: function() {
  },

  /**
   * Determine how many messages can be displayed at once for the current
   * window/device/screen size.  This should be used in tests where scrolling
   * is involved to make sure that we have enough messages to accurately test
   * scrolling.
   */
  getMaxVisibleMessageCount: function() {
  },
};

baseCardMagic.mixInSelectors(
  MessageListHelper.prototype,
  [
    {
      name: 'notificationBar',
      desc: 'blue in-app notification bar for new messages',
      selector: '.msg-list-topbar',
    },
    {
    }
  ])
;
