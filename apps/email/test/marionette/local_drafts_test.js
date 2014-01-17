var Email = require('./lib/email');
var assert = require('assert');
var serverHelper = require('./lib/server_helper');

marionette('local drafts', function() {
  var app,
      client = marionette.client({
        settings: {
          // disable keyboard ftu because it blocks our display
          'keyboard.ftu.enabled': false
        }
      });

  setup(function() {
    app = new Email(client);
    app.launch();
  });

  var server = serverHelper.use(null, this);

  test('round-tripping drafts should not corrupt the message author',
       function() {
    const EMAIL_ADDRESS = 'firefox-os-drafts@example.com';
    const EMAIL_SUBJECT = 'I still have a dream';

    app.initialSetup([server]);

    app.switchToFolder({ type: 'localdrafts' });

    // create and save a (local) draft
    app.tapCompose();
    app.typeTo(EMAIL_ADDRESS);
    app.typeSubject(EMAIL_SUBJECT);
    app.saveDraft();

    // edit the draft, then save it again
    app.tapEmailBySubject(EMAIL_SUBJECT, 'compose');
    app.saveDraft();

    // verify the author hasn't changed to undefined or otherwise broken
    app.assertMessagesInList([
      { author: EMAIL_ADDRESS, subject: EMAIL_SUBJECT }
    ]);
    var email = app.getEmailBySubject(EMAIL_SUBJECT).
      findElement('.msg-header-author').
      text();

    assert.equal(
      email,
      EMAIL_ADDRESS,
      email + ' should equal ' + EMAIL_ADDRESS
    );
  });

  test.skip('should show correct name in a item of mail list', function() {
    const NAME = 'FireFox OS';
    const EMAIL_ADDRESS = 'firefox-os-drafts@example.com';
    const MAILBOX = NAME + ' <' + EMAIL_ADDRESS + '>';
    const EMAIL_SUBJECT = 'I still have a dream';
    const SPACE = ' ';

    app.manualSetupImapEmail(server);

    // go to the Local Drafts page
    app.tapFolderListButton();
    app.tapLocalDraftsItem();

    // save a local draft
    app.tapCompose();
    app.typeTo(MAILBOX);
    // tpye a space to create the bubble
    app.typeTo(SPACE);
    app.typeSubject(EMAIL_SUBJECT);
    app.saveLocalDrafts();

    // edit the draft to save it again
    app.tapEmailBySubject(EMAIL_SUBJECT, 'compose');
    app.saveLocalDrafts();

    // get name on the email item
    var name = app.getEmailBySubject(EMAIL_SUBJECT).
      findElement('.msg-header-author').
      text();

    assert.equal(
      name,
      NAME,
      name + ' should equal ' + NAME
    );
  });
});
