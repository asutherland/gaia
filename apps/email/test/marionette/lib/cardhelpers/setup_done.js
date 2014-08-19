/*jshint node: true, browser: true */
'use strict';
var baseCardMagic = require('./base_card_magic');

function SetupDoneHelper(opts) {
  this._init(opts);
}
SetupDoneHelper.prototype = {
  // FUTURE: add another account path.

  doneAddingAccountsShowMail: function() {
    this._logTestAction('hit show mail and go to the newly added inbox');
    this._tap_showMail();
    var messageList = this._helpers.card.waitForAndWrapNewCard({
      resetCards: true,
      type: 'message_list',
      waitForLog: { w: 'message_list.complete' }
    });
    return messageList;
  }
};

baseCardMagic.mixInWisDOM({
  prototype: SetupDoneHelper.prototype,
  type: 'setup_done',
  selector: '.card-setup-done',
  actions: {
    addAnotherAccount: {
      desc: 'repeat the setup process',
      selector: '.sup-add-another-account-btn'
    },
    showMail: {
      desc: 'go to the inbox / show the account',
      selector: '.sup-show-mail-btn'
    }
  }
});

module.exports = SetupDoneHelper;
