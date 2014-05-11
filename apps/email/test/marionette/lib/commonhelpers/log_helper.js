/*jshint node: true, browser: true */
'use strict';

/**
 * Handles waiting on logs from the client as well as our single point of
 * logging from inside the test framework.
 */

function LogHelper(client) {
  this._client = client;
}

/**
 * Given a log string, try and extract an e-mail structured log from it,
 * returning the object on success and null on failure.
 */
LogHelper.prototype.extractEmailStructuredLog = function(str) {
  if (/^EIA{/.test(str)) {
    return JSON.parse(str.substring(3));
  }
  return null;
};

/**
 * Synchronously wait for one or more log patterns to occur (in sequence).
 *
 * At some point we could support using RegExps in our pattern in the case of
 * logs that could turn out a few different ways, but we might just want our
 * callers to be more certain about what is going on.
 *
 * @return the log/logs that matched.
 */
LogHelper.prototype.waitForLogMatching = function(patterns) {
  var unwrapResult = false;
  if (!Array.isArray) {
    patterns = [patterns];
    unwrapResult = true;
  }
  var iPattern = 0;
  var matches = [];

  this._client.logger.waitForLogMessage(function(msg) {
    var logObj = this.extractEmailStructuredLog(msg.message);
    if (!logObj) {
      return false;
    }

    var pattern = patterns[iPattern];
    // Check everything in the pattern in order
    for (var key in pattern) {
      var expected = pattern[key];
      var actual = logObj[key];
      if (expected !== actual) {
        return false;
      }
    }
    matches.push(msg);
    // Okay, it was a match, return true if we're all done because we have no
    // more patterns to check out.
    return (++iPattern >= patterns.length);
  }.bind(this));

  if (unwrapResult) {
    matches = matches[0];
  }
  return matches;
};

LogHelper.logTestAction = function(description) {
  if (this._client.recorderHelper) {
    this._client.recorderHelper.logObj({
      source: 'test',
      type: 'testAction',
      action: description
    });
  }
};

module.exports = LogHelper;
