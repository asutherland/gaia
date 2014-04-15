'use strict';
var baseCardMagic = require('./base_card_magic');

var autoconfigHack = require('../monkeypatchers/autoconfig_hack');

function SetupAccountInfoHelper(client) {
  this._init(client);
}
SetupAccountInfoHelper.prototype = {
  /**
   * Fill out the fields, and either succeed and find ourselves on a
   * setup_account_prefs card, or fail and find ourselves back on this card.
   *
   * @param {Object} opts
   * @param {AccountInfo} opts.serverAccount
   * @param {Boolean} opts.expectSuccess
   */
  setupAccount: function(opts) {
    var serverAccount = opts.serverAccount;

    this.fillByClickingAndTyping(
      'enter autoconfig details',
      {
        name: serverAccount.displayName,
        email: serverAccount.emailAddress,
        password: serverAccount.credentials.password
      });

    // This will cause the tryToCreateAccount call be saved off and not actually
    // called yet.  Since the call is actually made on the progress card, this
    // lets us predictably control when the stupid card appears and disappears.
    autoconfigHack.prepareFakeAutoconfig(this._client, {
      type: serverAccount.receive.type + '+smtp',
      incoming: serverAccount.receive,
      outgoing: serverAccount.send
    });

    this._logTestAction('hit next to initiate autoconfig');
    this._tap_next();

    var setupProgress = this._helpers.card.waitForAndWrapNewCard({
      type: 'setup_progress'
    });

    // now let the account creation happen
    this._logTestAction('releasing autoconfig');
    autoconfigHack.releaseFakeAutoconfig(this._client);

    if (!opts.expectSuccess) {
      // wait for the progress card to disappear, returning us to ourselves.
      this._helpers.card.waitForCardToBeRemovedAndUsToReturnTo({
        removed: setupProgress,
        returnTo: this
      });
      return null;
    }


  }
};

baseCardMagic.mixInWisDOM({
  prototype: SetupAccountInfoHelper,
  cardName: 'setup_account_info',
  selector: '.card-setup-account-info',
  actions: {
    next: {
      desc: 'next button to try to automatically create the account',
      selector: '.sup-info-next-btn'
    },
    manualSetup: {
      desc: 'manual setup button to display manual setup UI',
      selector: '.sup-manual-config2'
    }
  },
  inputs: {
    name: {
      desc: 'display name input',
      selector: '.sup-info-name'
    },
    email: {
      desc: 'email address',
      selector: '.sup-info-email'
    },
    password: {
      desc: 'password',
      selector: '.sup-info-password'
    }
  },
  display: {
    errorDisplayed: {
      desc: 'collapsible region visible when a setup error occurs',
      selector: '.sup-error-region',
      value: '!.collapsed'
    },
    errorMessage: {
      desc: 'the localized human-readable error message',
      selector: '.sup-error-message',
      value: 'text'
    },
    errorCode: {
      desc: 'the machine-friendly error code',
      selector: 'sup-error-code',
      value: 'text'
    }
  }
});
