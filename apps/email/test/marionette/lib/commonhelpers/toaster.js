/*jshint node: true, browser: true */
'use strict';
function ToasterHelper() {
}
ToasterHelper.prototype = {
  /**
   * Wait for a toast to be displayed
   *
   * @param {Object} opts
   * @param {'undo'|'retry'} type
   *   The type of operation being displayed
   * @param {String} operation
   *   The operation code for an UndoableOperation (type=undo), or the message
   *   type (type=retry).
   * @param {'tap'|'undo'|'retry'|'timeout'} action
   *   What should we do once we see the toaster?   We can 'tap' on it to make
   *   it go away immediately, hit its 'undo' button, hit its 'retry' button,
   *   or trigger its 'timeout' code path so it disappears.  (We will not
   *   actually wait for it to timeout; we
   */
  waitForToast: function() {
  }
};

selectorMagic.mixInSelectors(
  ToasterHelper.prototype,
  [
    {
    }
  ]);
