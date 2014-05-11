/*jshint node: true */
/*global marionette, test */
'use strict';

var recorderClientHelper = require('./lib/recorder_client_helper');
var EmailApp = require('./lib/email');
var serverHelper = require('./lib/server_helper');

marionette('email', function() {
  var client = recorderClientHelper.recordedMarionetteClient();

  var serverAccount = serverHelper.use();

  test('message reading', function() {
    // default server
    serverAccount.haveFolderWithMessagesNewestToOldest(
      'INBOX',
      [
        { subject: 'Alpha' },
        { subject: 'Beta' },
        { subject: 'Charlie' },
        { subject: 'Dougie' },
        { subject: 'Elefino' },
      ]);

    var app = new EmailApp(client);
    var messageList = app.launchExpectingAccountSetup({
      setupAccount: serverAccount
    });
    var reader;

    return;

    ////////////////////////////////////////////////////////////////////////////
    reader = messageList.readEmail('display the first message', { index: 0 });

    app.testing('message display');
    reader.assertDisplayedMessage(serverAccount.INBOX[0]);

    ////////////////////////////////////////////////////////////////////////////
    app.testing('simple navigation');

    reader = messageList.readEmail('display the first message', { index: 0 });
    reader.assertUIState(
      'msgUp is disabled at the top of the list',
      {
        message: messages[0],
        msgUpEnabled: 'disabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceDown('advance to the second/middle message');
    reader.assertUIState(
      'both navigation buttons are enabled in the middle of the list',
      {
        message: messages[1],
        msgUpEnabled: 'enabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceDown('advance to the last message');
    reader.assertUIState(
      'msgDown is disabled at the bottom of the list',
      {
        message: messages[2],
        msgUpEnabled: 'enabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceDown(
      'nothing happens if we hit down when disabled/at the bottom',
      { expectFail: true });
    reader.assertUIState(
      'the UI should not have changed',
      {
        message: messages[2],
        msgUpEnabled: 'enabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceUp('back to the middle message');
    reader.assertUIState(
      'both navigation buttons are enabled in the middle of the list',
      {
        message: messages[1],
        msgUpEnabled: 'enabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceUp('back to the first message');
    reader.assertUIState(
      'msgUp is disabled at the top of the list',
      {
        message: messages[0],
        msgUpEnabled: 'disabled',
        msgDownEnabled: 'enabled'
      });

    reader.advanceUp(
      'nothing happens if we hit up when disabled/at the top',
      { expectFail: true });
    reader.assertUIState(
      'msgUp is disabled at the top of the list',
      {
        message: messages[0],
        msgUpEnabled: 'disabled',
        msgDownEnabled: 'enabled'
      });

    ////////////////////////////////////////////////////////////////////////////
    app.testing('reacting to added and removed messages');



    ////////////////////////////////////////////////////////////////////////////
    app.testing('scrolling of the message list to match reader traversal');

  });
});
