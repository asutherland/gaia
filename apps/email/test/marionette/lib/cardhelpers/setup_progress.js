/*jshint node: true, browser: true */
'use strict';
var baseCardMagic = require('./base_card_magic');

var autoconfigHack = require('../monkeypatchers/autoconfig_hack');

function SetupProgressHelper(client) {
  this._client = client;
}
SetupProgressHelper.prototype = {
};

baseCardMagic.mixInWisDOM({
  prototype: SetupProgressHelper,
  type: 'setup_progress',
  selector: '.card-setup-progress'
});
