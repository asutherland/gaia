/*jshint node: true, browser: true */
'use strict';
var baseCardMagic = require('./base_card_magic');

var autoconfigHack = require('../monkeypatchers/autoconfig_hack');

function SetupProgressHelper(opts) {
  this._init(opts);
}
SetupProgressHelper.prototype = {
};

baseCardMagic.mixInWisDOM({
  prototype: SetupProgressHelper.prototype,
  type: 'setup_progress',
  selector: '.card-setup-progress'
});
module.exports = SetupProgressHelper;
