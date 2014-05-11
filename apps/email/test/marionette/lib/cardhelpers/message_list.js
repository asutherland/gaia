/*jshint node: true, browser: true */
'use strict';
var baseCardMagic = require('./base_card_magic');

function MessageListHelper(coreOpts) {
  this._init(coreOpts);
}
MessageListHelper.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  // Folder Navigation

  switchToAccountInbox: function(serverAccount) {
  },

  switchToFolder: function(folderSpec) {
    throw new Error('Welcome to the commons; implement me!');
  },

  //////////////////////////////////////////////////////////////////////////////
  // Scrolling, Visibility

  /**
   * Scrolls so the first message in the list is at the top of the scroll area,
   * avoiding scrolling the search box into view.
   */
  scrollToTopMessage: function() {
    throw new Error('Welcome to the commons; implement me!');
  },

  /**
   * Scrolls so the last message in the list is at the bottom of the scroll
   * area.
   */
  scrollToBottomMessage: function() {
    throw new Error('Welcome to the commons; implement me!');
  },

  /**
   * Scroll so that the given message is fully visible
   */
  scrollMessageIntoView: function(message) {
    throw new Error('Welcome to the commons; implement me!');
  },

  /**
   * The message should be fully visible, error if not.
   *
   * This method is not stateful and does not care if wacky DOM node recyling
   * has gone on; it gets the fully visible messages and checks if any of them
   * are our message.
   */
  assertMessageVisible: function() {
    throw new Error('Welcome to the commons; implement me!');
  },

  /**
   * The message should not be visible, error if it is.
   *
   * This method is not stateful and does not care if wacky DOM node recyling
   * has gone on; it gets the fully visible messages and checks if any of them
   * are our message.
   */
  assertMessageNotVisible: function() {
    throw new Error('Welcome to the commons; implement me!');
  },

  /**
   * Determine how many messages can be displayed at once for the current
   * window/device/screen size.  This should be used in tests where scrolling
   * is involved to make sure that we have enough messages to accurately test
   * scrolling.
   */
  getMaxVisibleMessageCount: function() {
    throw new Error('Welcome to the commons; implement me!');
  },

  //////////////////////////////////////////////////////////////////////////////
  // Display a Message

  readEmail: function(desc, whichOne) {
    this._logTestAction(desc);

    this._cards.waitForAndWrapNewCard({
        type: 'message_reader',
        waitForLog: { w: 'reader.buildBodyDom', haveAllBodies: true },
      });
  },

  //////////////////////////////////////////////////////////////////////////////
  // Batch Edit Mode

  //////////////////////////////////////////////////////////////////////////////
};

baseCardMagic.mixInSelectors({
  prototype: MessageListHelper.prototype,
  type: 'message_list',
  actions: {
    notificationBar: {
      name: 'notificationBar',
      desc: 'blue in-app notification bar for new messages',
      selector: '.msg-list-topbar',
    },
  }
});

module.exports = MessageListHelper;
