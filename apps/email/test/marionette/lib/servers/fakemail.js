/*jshint node: true, browser: true */
'use strict';

var server = require('mail-fakeservers');
var msgGen = require('./messageGenerator');

/**
 * Updates given object with the state from an imapStack.
 *
 * @param {Object} serverAccount target.
 * @param {Object} stack to pull updates from.
 * @param {Object} options for setup.
 */
function updateState(serverAccount, stack, options) {
  function mixinCommonAccountDetails(infobits) {
    infobits.username = options.credentials.username;
    infobits.password = options.credentials.password;
    infobits.hostname = 'localhost';
    // our fake servers do not support SSL or STARTTLS or anything good
    infobits.socketType = 'plain';
  }

  switch (options.type) {
    case 'imap':
      serverAccount.receive = {
        type: 'imap',
        port: stack.imapPort
      };
      break;
    case 'pop3':
      serverAccount.receive = {
        type: 'pop3',
        port: stack.pop3Port
      };
      break;
  }
  mixinCommonAccountDetails(serverAccount.receive);

  serverAccount.send = {
    type: 'smtp',
    port: stack.smtpPort
  };
  mixinCommonAccountDetails(serverAccount.send);
}

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// from (node-imap) imap.js
function formatImapDateTime(date) {
  var s;
  s = ((date.getDate() < 10) ? ' ' : '') + date.getDate() + '-' +
       MONTHS[date.getMonth()] + '-' +
       date.getFullYear() + ' ' +
       ('0'+date.getHours()).slice(-2) + ':' +
       ('0'+date.getMinutes()).slice(-2) + ':' +
       ('0'+date.getSeconds()).slice(-2) +
       ((date.getTimezoneOffset() > 0) ? ' -' : ' +' ) +
       ('0'+(Math.abs(date.getTimezoneOffset()) / 60)).slice(-2) +
       ('0'+(Math.abs(date.getTimezoneOffset()) % 60)).slice(-2);
  return s;
}

function ServerAccount() {
  this._serverStack = null;

  this._msgGen = new msgGen.MessageGenerator();
}
ServerAccount.prototype = {
  haveFolderWithMessagesNewestToOldest: function(folderName, msgDefs) {
    if (folderName.toLowerCase() !== 'inbox') {
      this._serverStack.addFolder(folderName);
    }

    var msgReps = [];
    var msgGen = this._msgGen;
    msgDefs.forEach(function(msgDef, iMsgDef) {
      var tmpl = {
        age: { days: iMsgDef }
      };
      for (var key in msgDef) {
        tmpl[key] = msgDef[key];
      }
      var message = msgGen.makeMessage(tmpl);
      // Generate an rfc822 message, prefixing on a fake 'received' line so that
      // our INTERNALDATE detecting logic can be happy.
      //
      // XXX this currently requires the timezone to be the computer's local tz
      // since we can't force a timezone offset into a Date object; it's locale
      // dependent.
      var msgString =
        'Received: from 127.1.2.3 by 127.1.2.3; ' +
        formatImapDateTime(message.date) + '\r\n' +
        message.toMessageString();

      var rep = {
        flags: [],
        date: message.date.valueOf(),
        msgString: msgString
      };
      msgReps.push(rep);
    });

    this._serverStack.addMessagesToFolder({
      name: folderName,
      messages: msgReps
    });
  }
};

/**
 * @param {Object} options for setup.
 * @param {Object} mochaContext from callee.
 */
function use(options, mochaContext) {
  /**
   * Reused for every test/setup/teardown contains internal state so tests can
   * just directly reference the same object instead of manging state
   * themselves.
   *
   * XXX Everything about this file is weird now.  After things are working
   * we should really try and clean-up these abstractions.  Probably just
   * consider this file in the context of the planned GELAM test framework
   * refactoring, then update this.
   *
   * @type {Object}
   * @private
   */
  var serverAccount = new ServerAccount();
  serverAccount.displayName = options.displayName;
  serverAccount.emailAddress = options.emailAddress;

  serverAccount.credentials = options.credentials;

  // spawns servers
  var controlServer;

  // current imap/smtp servers
  var serverStack;

  suiteSetup(function(done) {
    this.timeout('20s');
    server.create(function(err, control) {
      controlServer = control;
      done(err);
    });
  });

  // we need a new stack each test
  setup(function(done) {
    var creationFunc;
    switch (options.type) {
      case 'imap':
        creationFunc = 'createImapStack';
        break;
      case 'pop3':
        creationFunc = 'createPop3Stack';
        break;
    }

    controlServer[creationFunc](options, function(err, _serverStack) {
      // update the state information
      updateState(serverAccount, _serverStack, options);

      serverStack = serverAccount._serverStack = _serverStack;
      done(err);
    });
  });

  // clear away old servers
  teardown(function(done) {
    controlServer.cleanupStacks(done);
  });

  // so node can exit close the server processes.
  suiteTeardown(function() {
    controlServer.kill();
  });

  return serverAccount;
}

module.exports.use = use;
