'use strict';

var recorderClientHelper = require('./lib/recorder_client_helper');
var EmailApp = require('./lib/email');
var serverHelper = require('./lib/server_helper');

marionette('email', function() {
  var client = recorderClientHelper.recordedMarionetteClient();

  test('compose', function() {
    // default server
    var serverAccount = serverHelper.use();
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

    var composer;
    composer.lint();
    messageList.lint();

    ////////////////////////////////////////////////////////////////////////////
    app.testing('draft persistence');

    composer.assertUIState(
      'draft state fully restored',
      {

      });
  });
});
