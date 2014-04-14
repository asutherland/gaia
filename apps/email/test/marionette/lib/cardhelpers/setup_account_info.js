'use strict';
var baseCardMagic = require('./base_card_magic');

var autoconfigHack = require('../monkeypatchers/autoconfig_hack');

function SetupAccountInfoHelper(client) {
  this._init(client);
}
SetupAccountInfoHelper.prototype = {
  /**
   * Fill out the fields
   */
  setupAccount: function(serverAccount) {
    this.formFill({
      name: serverAccount.displayName,
      email: serverAccount.emailAddress,
      password: serverAccount.credentials.password
    });

    autoconfigHack.prepareFakeAutoconfig(this._client, {
      type: serverAccount.receive.type + '+smtp',
      incoming: serverAccount.receive,
      outgoing: serverAccount.send
    });

    this.tapNext();
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
  }
});
