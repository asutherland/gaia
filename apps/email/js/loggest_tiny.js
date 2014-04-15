'use strict';

/**
 * Bare-bones non-hierarchical logger, currently specialized for the e-mail
 * app main thread, extremely so.
 *
 * Note that this is an interim logging format.  The canonical Mozilla
 * structured logging standard (for test harnesses) is documented at
 * http://mozbase.readthedocs.org/en/latest/mozlog_structured.html.
 *
 * We don't conform to that right now since we're not a test harness and we're
 * trying to:
 * - have our output be somewhat human readable
 * - keep things terse; our logs go into a circular buffer either way, so it
 *   does pay to try and be at least a little conservative, especially if the
 *   buffer is not compressed.
 *
 * The 'EIA' magic marker is an inherently versioned marker for use only by this
 * version of the e-mail app.  Nothing else should crib us, and we should change
 * the string as appropriate.
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
    console.log('EIA' + eventStr);
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
