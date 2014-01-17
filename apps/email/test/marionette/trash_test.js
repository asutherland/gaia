/**
 * Test that deleted messages go to the trash folder, that messages deleted from
 * the trash folder get nuked, and that the empty trash functionality works.
 *
 * All of this stuff is already extensively tested in the GELAM back-end tests.
 * This file just makes sure that we didn't break the UI hookup and that UI
 * specific logic that is not covered by UI unit tests works.
 *
 * Key notes:
 * - Empty trash is only available on POP3 servers.  So we use POP3 for this
 *   test.
 **/
var Email = require('./lib/email');
var serverHelper = require('./lib/server_helper');

marionette('trash', function() {
  var app,
      client = marionette.client({
        settings: {
          // disable keyboard ftu because it blocks our display
          'keyboard.ftu.enabled': false
        }
      }),
      imapServer = serverHelper.use({
        type: 'imap',
        credentials: {
          username: 'testy1',
          password: 'testy1'
        }
      }, this),
      pop3Server = serverHelper.use({
        type: 'pop3',
        credentials: {
          username: 'testy2',
          password: 'testy2'
        },
        initialMessageSubjects: [
          'foo1', 'foo2', 'foo3'
        ]
      }, this);

  setup(function() {
    app = new Email(client);
    app.launch();
    app.initialSetup([imapServer, pop3Server]);
  });

  /**
   * Test everything trash related.  I'm putting this in one function because
   * we don't need separate runs for these test steps.
   */
  test('works right', function() {
    // (we are now in the INBOX of the POP3 account)

    // -- delete 2 messages, see them show up in the trash
    app.batchEditMessages('delete', ['foo1', 'foo2']);
    app.switchFolder({ type: 'trash' });
    app.assertMessagesPresentInList(['foo1', 'foo2']);
    app.assertMessagesInList({ subjects: ['foo1', 'foo2'] });

    // -- delete one of the messages in the trash, it disappears forever

  });
});
