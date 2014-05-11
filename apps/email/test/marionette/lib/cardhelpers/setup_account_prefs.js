/*jshint node: true, browser: true */
'use strict';
var baseCardMagic = require('./base_card_magic');

function SetupAccountPrefsHelper(client) {
  this._init(client);
}
SetupAccountPrefsHelper.prototype = {
  next: function() {
    this._logTestAction('hit next to finalize setup and show message_list');
    this._tap_next();
    var setupDone = this._helpers.card.waitForAndWrapNewCard({
      type: 'setup_done'
    });
  }
};

baseCardMagic.mixInWisDOM({
  prototype: SetupAccountPrefsHelper,
  type: 'setup_account_prefs',
  selector: '.card-setup-account-prefs',
  actions: {
    next: {
      desc: 'next button to try to complete setup',
      selector: '.sup-info-next-btn'
    },
  },
  inputs: {
    syncInterval: {
      desc: 'select cronsync interval',
      selector: '.tng-account-check-interval'
    },
    notifyNewMessages: {
      desc: 'should we generate system notifications for cronsynced messages',
      selector: '.tng-notify-mail'
    }
  }
});
