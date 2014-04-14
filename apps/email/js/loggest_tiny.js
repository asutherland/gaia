'use strict';

/**
 * Bare-bones non-hierarchical logger, currently specialized for the e-mail
 * app main thread, extremely so.
 **/

define(function(require) {

function Loggest() {
  this.log = this._log.bind(this, '\x1b[32m', 'log');
  this.warn = this._log.bind(this, '\x1b[33m', 'warn');
  this.error = this._log.bind(this,'\x1b[31m', 'err');
}
Loggest.prototype = {
  /**
   * Actual dump() to adb/stdout call that takes the mashed-up JSON string and
   * the color hints passed through from the level call.  Intended to be
   * clobbered/hooked by unit tests or similar.
   */
  _out: function(eventStr, pretty) {
    //dump(pretty + 'EIA' + eventStr + '\x1b[0m\n');
    console.log(eventStr);
  },

  _log: function(pretty, level, what, details) {
    var deets = JSON.stringify(details);
    if (deets.length > 2) {
      deets = ',' + deets.slice(1);
    }
    else {
      deets = '}';
    }
    // we have an inherent serialization of events because of the output
    // mechanism, so there is no need to use a higher precision timer than
    // Date.now().
    var eventStr = '{"c":"main","w":"' + what + '","l":"' + level +
                     '","ts":' + Date.now() + deets;
    this._out(eventStr, pretty);
  },
};

var daLog = new Loggest();

// Did I mention we are special-cased?
window.onerror = function errHandler(msg, url, line) {
  daLog.error('onerror', { msg: msg, url: url, line: line });
  return false;
};

return daLog;

}); // end define
