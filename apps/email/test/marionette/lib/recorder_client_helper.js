/* jshint node: true, browser: true */
/* global marionette, suiteSetup, setup, teardown, suiteTeardown */
'use strict';

/**
 * When running b2g-desktop and if available, wrap its invocation so that we are
 * able to record its execution to a .webm file.
 *
 **/

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var xRecorder = require('x-recorder');
var EventEmitter = require('events').EventEmitter;

// XXX until this is in gaia/shared/test/integration we need this here.
marionette.plugin('logger', require('marionette-js-logger'));


/**
 * Return true if our target is (local) b2g-desktop and we have xvfb and ffmpeg
 * available.
 */
function canRunRecorded() {
  // XXX IMPLEMENT AFTER WORKING AT ALL WITH THOSE THINGS INSTALLED
  return true;
}

/**
 * Given an absolute test file path, convert it to a nice small path hierarchy.
 */
function normalizeTestFilePath(file) {
  var parts = file.split(path.sep);
  var useRelPath = '';

  // assume the path looks something like:
  //   /blah/blah/some-gaia-name/apps/APPNAME/test/marionette/FILENAME
  // We care about the APPNAME, and the 'apps' dir helps us find it.  We
  // don't want to assume too much about the apps' internal structure for
  // reasons of potential brittleness.
  var appDirIndex = null;
  // Don't search things that can't be the app indicator, specifically, ignore
  // the last 3 since we want at least: apps/APPNAME/sometestindicator/FILENAME
  parts.slice(0, -3).some(function(part, index) {
    // There are a bunch of app directory roots; try and match the expected
    // pattern.
    if (/^(?:.+[-_])?apps$/.test(part)) {
      appDirIndex = index;
      return true;
    }
    return false;
  });

  if (appDirIndex !== null) {
    useRelPath += parts[appDirIndex + 1] + path.sep;
  }

  // Just use the file-name sans-extension (to avoid confusion) and
  // spaces-coverted-to-underscores (since spaces can be annoying in command
  // lines)
  useRelPath += path.basename(file, path.extname(file))
                    .replace(/ /g, '_');

  return useRelPath;
}

/**
 * Create a reasonable filename given a test title.
 */
function normalizeTestTitleToFile(title) {
  return title.replace(/\W+/g, '_').substring(0, 24).toLowerCase();
}

/**
 * The system app shows startup logos or videos or what not, depending on
 * configuration.  Although this is not a bad idea, as of writing this, the
 * logo's fadeout styling in initlogo.css takes 2 seconds to complete, which
 * is not helpful when unit testing.  Until we have the time dilation factor
 * available to us for animations, it's best to just clobber it to death.
 *
 * The code lives in apps/system/js/init_logo_handler.js.
 */
function nukeAnnoyingOsLogo() {
}

exports.recordedMarionetteClient = function() {
  // Note: all settings are biased towards the e-mail app's use-case right now.
  //
  // Also, we will mutate this after we spin up the xvfb instance; this entire
  // dictionary is held by reference and not remoted until the remote
  // instance is created.
  var profileSettings = {
    prefs: {
      // Disable the keyboard for now; this can be re-enabled when we have
      // implemented transition/animation acceleration.  While there are a set
      // of edge-cases that the keyboard can cause, we have no tests for this
      // area yet.
      'dom.mozInputMethod.enabled': false,
      // Do not require the B2G-desktop app window to have focus (as per the
      // system window manager) in order for it to do focus-related things.
      'focusmanager.testmode': true,
    },
    settings: {
      // Explicitly disable the FTU (first-run) series of cards
      'ftu.manifestURL': '',
      // We also wouldn't want the keyboard FTU, although we've disabled the
      // keyboard.
      'keyboard.ftu.enabled': false,
      // lock-screen stuff:
      // 'screen.timeout'
      'lockscreen.enabled': false
      // 'lockscreen.locked'
    }
    // no 'apps' needed
    // 'hostOptions' gets filled in below
  };

  // Check if we are actually in a configuration where we can do our fancy
  // stuff.  If not, just bail and use the standard marionette client logic.
  if (!canRunRecorded) {
    return marionette.client(profileSettings);
  }

console.log('IN RECORDER LAND');

  // Use the dominant/smallest resolution we have for tests by default.  We
  // will probably need to actually run with permutations in the future.
  var dimWidth = 320;
  var dimHeight = 480;

  // It's quite possible there will be annoying window borders or something.
  var windowPaddingX = 10;
  var windowPaddingY = 10;

  var xvfbDimensions = (dimWidth + windowPaddingX) + 'x' +
                       (dimHeight + windowPaddingY);

  var testArtifactsDir;

  var xvfb, xcapture, logStream;

  // We want our suite setup to run prior to the host creation so we can set-up
  // the xvfb instance.
  suiteSetup(function(done) {
console.log('creating xvfb');

    xvfb = new xRecorder.Xvfb({
      dimensions: xvfbDimensions + 'x24',
    });
    xvfb.start(function() {
      profileSettings.hostOptions = {
        envOverrides: {
          DISPLAY: ':' + xvfb.display
        }
      };
console.log('xvfb started. super happy!');
      done();
    });
  });

  // Likewise, we want to start recording prior to each test case.
  setup(function(done) {
console.log('creating log');

    var curTest = this.currentTest;

    testArtifactsDir = 'artifacts' + path.sep +
                         normalizeTestFilePath(curTest.title) + path.sep;

    // Everything else we're doing is inherently dependent on creating the dir,
    // so just do it synchronously (for now).
    if (!fs.existsSync(testArtifactsDir)) {
      mkdirp.sync(testArtifactsDir);
    }

    var basenamePath = testArtifactsDir +
                         normalizeTestTitleToFile(curTest.title);

    var videoPath = basenamePath + '.webm';
    // We write one JSON string per line since consumers should absolutely
    // process this as a stream rather than trying to load it as a single big
    // array.  While it might be friendly to try and let them do that load if
    // they wanted, there's a fair chance we might have to deal with crashes,
    // in which case we may fail to close out the file and the string may end
    // up only partially written.
    var jsonLogPath = basenamePath + '.jsons';

    logStream = fs.createWriteStream(
      jsonLogPath,
      { flags: 'w', encoding: 'utf8', mode: /* 0o666 */ 483 });

    // We cannot access client.logger until the plugin is spun up at the
    // 'startSession' hook, to defer registering for messages until after that
    // time.  (See below.)

console.log('creating xcapture, save target of', videoPath);
    xcapture = new xRecorder.XCapture({
      display: xvfb.display,
      output: videoPath,
      tool: 'avconv',
      codec: 'libvpx',
      dimensions: xvfbDimensions
    });
    xcapture.start(function() {
      done();
    });
  });


  // Fetch the logs before we shut down the host.
  teardown(function() {
console.log('grabbing log messages at shutdown');
    client.logger.grabLogMessages();
  });

  // Investigate failures and log state.
  teardown(function() {
console.log('failcheck', this.currentTest.state);
    if (this.currentTest.state !== 'failed') {
      return;
    }

console.log('FAILURE FAILURE FAILURE, filling in details');
    var failureDetails = {};
    client.recorderHelper.emit('fill-in-failure-details', failureDetails);
    var failureLog = {
      source: 'test',
      type: 'failureLog',
      details: failureDetails
    };
    client.recorderHelper.logObj(failureLog);
  });

  var client = marionette.client(profileSettings);
  // Disable the default script timeout which logs data-URI screenshots.
  client.onScriptTimeout = null;
  client.recorderHelper = new EventEmitter();
  // helper method to help us/others be able to explicitly log something to the
  // log file.
  client.recorderHelper.logObj = function(obj) {
    if (logStream) {
      logStream.write(JSON.stringify(obj) + '\n');
    }
  };



  // - Things that require the plugins to exist.
  // Plugins are created during the setup() phase of marionette-js-runner's
  // client-creating logic.  That stage also creates the session as a blocking
  // asynchronous process.  Thus we are ensured that client.logger exists by
  // the time our function is called since we are calling setup() after
  // marionette.client.  However, when we become a plugin we will want to wait
  // for startSession since that ensures all plugins have been initialized
  // without requiring an explicit plugin ordering.
  setup(function() {
//    client.addHook('startSession', function() {
console.log('listening for logger messages');
      client.logger.on('message', function(msg) {
        var logObj = {
          source: 'client',
          type: 'log',
          msg: msg
        };
        logStream.write(JSON.stringify(logObj) + '\n');
      });
      nukeAnnoyingOsLogo(client);
//    });
  });

  // But we want to stop recording after the host gets torn down.
  teardown(function(done) {
console.log('stopping xcapture');
    xcapture.stop(function(err) {
console.log('  stopped. err?', err);
      logStream.end(function() {
        logStream = null;
        done();
      });
    });
    xcapture = null;
  });

  // And to kill the xvfb instance after the host gets
  suiteTeardown(function(done) {
console.log('stopping xvfb');
    xvfb.stop(function(err) {
console.log('  stopped. err?', err);
      done();
    });
    xvfb = null;
  });

  return client;
};
