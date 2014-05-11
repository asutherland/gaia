/*jshint node: true, browser: true */
'use strict';
<<<<<<< HEAD
=======

/**
 * E-mail
 */
>>>>>>> 0eb0c33... rebase status commit

var CardDealer = require('./cardhelpers/card_dealer');
var LogHelper = require('./commonhelpers/log_helper');

function EmailApp(client) {
  // our unscoped client; this really only matters if we want to be able to
  // put things onto the prototype that will be seen by all other users of the
  // client.
  this._rawClient = client;
  // Our customized client.  This is what we hand to all other e-mail stuff so
  // they get our amazingly chosen defaults.  Leave marked public-ish because
  // better people do something sketchy using our scoped client than bypass us.
  this.client = client.scope({
    // Fail fast.  If we're looking for them, our elements need to already be
    // there.  See our README.md for our strategy and related details.  If we're
    // waiting for something asynchronous to happen we wait for a log entry and
    // we DO allow for random VM suckiness and delays there.
    searchTimeout: 0
  });

  // we have a bunch'o'helpers; our options are to pass around a crap-ton of
  // them individually and have to manually update that, stash them on the
  // client, or just pass a dict around.  I'm going with the dict because the
  // client-stash option seems likely to be confusing to people just skimming
  // the code.
  this._helpers = {
    log: null,
    card: null
  };

  this._logHelper = this._helpers.log = new LogHelper(this.client);
  this._cardHelper = this._helpers.card =
    new CardDealer(this.client, this._helpers);
}
module.exports = EmailApp;

EmailApp.EMAIL_ORIGIN = 'app://email.gaiamobile.org';

EmailApp.prototype = {
  /**
   * Launch the e-mail app.  If you are a test, do not call this.  Instead, use
   * one of `launchExpectingAccountSetup`, `launchExpectingDefaultInbox`, or
   * create a new helper if those are somehow insufficient.
   */
  _launch: function() {
    var client = this.client;
    client.apps.launch(EmailApp.EMAIL_ORIGIN);
    client.apps.switchToApp(EmailApp.EMAIL_ORIGIN);
    // wait for the document body to know we're really launched
    client.helper.waitForElement('body');
  },

  /**
   * Launch the e-mail app expecting that there are no accounts and we will end
   * up on the setup_account_info card.  We will throw if we end up on any other
   * card.
   *
   * @param {AccountInfo|"manual"} opts.setupAccount
   *   If an `AccountInfo` object is provided we will configure the given
   *   account for you using the settings provided in the `accountOptions` if
   *   also provided.  We will leave you on the message list for the account's
   *   new Inbox, returning a `MessageListHelper` for it.
   *
   *   If "manual" is provided, then we will leave you on the setup_account_info
   *   card, returning a `SetupAccountInfoHelper` for it.
   * @param {AccountSetupOptions} [opts.accountOptions]
   *   Tells us what options to pick on the setup_account_prefs card.  If not
   *   provided, we will not set anything and leave the defaults on.
   *
   * @return {MessageListHelper|SetupAccountInfoHelper}
   */
  launchExpectingAccountSetup: function(opts) {
    if (!opts.setupAccount) {
      throw new Error('Provide setupAccount. Read the docs!');
    }

    this._launch();
    var setupAccountInfo = this._cardHelper.waitForAndWrapNewCard({
      type: 'setup_account_info'
    });
    if (opts.setupAccount === 'manual') {
      return setupAccountInfo;
    }

    var setupAccountPrefs = setupAccountInfo.setupAccount({
      serverAccount: opts.setupAccount,
      expectSuccess: true
    });

    if (opts.accountOptions) {
      setupAccountPrefs.fillByClickingAndTyping(opts.accountOptions);
    }
    var setupDone = setupAccountPrefs.next();
    var messageList = setupDone.doneAddingAccountsShowMail();

    return messageList;
  },

  /**
   * Launch the e-mail app expecting that there is at least one account and we
   * will end up on the message_list card for the default account's inbox.
   */
  launchExpectingDefaultInbox: function() {
  },

  /**
   * Assume some other app has triggered the e-mail app via a 'share' or 'new'
   * activity and there are no accounts and so we will display a "are you sure
   * you want to create an account?" type prompt.
   *
   * @param {"share"|"new"} opts.activityType
   *   The exact activity type that is triggering us so we can double-check.
   * @param {AccountInfo|"manual"|false} opts.setupAccount
   *   If an `AccountInfo` object is provided we will say yes at the prompt and
   *   configure the given account for you using the settings provided in the
   *   `accountOptions` if also provided.  We will leave you on the message list
   *   for the account's new Inbox, returning a `MessageListHelper` for it.
   *
   *   If "manual" is provided, then we will say yes at the prompt and leave you
   *   on the setup_account_info card, returning a `SetupAccountInfoHelper` for
   *   it.
   *
   *   If false we will cancel at the prompt and the activity will post an
   *   error and the e-mail app will do whatever it does in this case.  And
   *   this method will return null.
   * @param {AccountSetupOptions} [opts.accountOptions]
   *   Tells us what options to pick on the setup_account_prefs card.  If not
   *   provided, we will not set anything and leave the defaults on.
   *
   * @return {MessageListHelper|SetupAccountInfoHelper|null}
   */
  activityTriggeredExpectingAccountSetupAndPrompt: function(opts) {
  },

  /**
   * Assume some other app has triggered the e-mail app via a 'share' or 'new'
   * activity and at least one account exists and so a compose card will be
   * displayed.
   *
   * @return {ComposeHelper}
   */
  activityTriggeredExpectingCompose: function() {
  },

  /**
   * Assume a single message notification has triggered the e-mail app and so
   * a message_reader card will be displayed.
   *
   * @return {MessageReaderHelper}
   */
  notificationTriggeredExpectingMessageReader: function() {
  },

  /**
   * Assume a mulit-message notification has triggered the e-mail app and so
   * a message_list card will be displayed.
   *
   * @return {MessageListHelper}
   */
  notificationTriggeredExpectingMessageList: function() {
  },
};
<<<<<<< HEAD

require('./debug')('email', Email.prototype);
=======
>>>>>>> 0eb0c33... rebase status commit
