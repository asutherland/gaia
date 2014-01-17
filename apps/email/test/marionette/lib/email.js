/*jshint node: true, browser: true */
var assert = require('assert');
var MailDOMMessageList = require('./mail_dom_message_list');

function Email(client) {
  this.client = client;
}
module.exports = Email;

Email.EMAIL_ORIGIN = 'app://email.gaiamobile.org';

var Selector = {
  notificationBar: '.card-message-list .msg-list-topbar',
  // -- setup_account_info
  setupNameInput: '.card-setup-account-info .sup-info-name',
  setupEmailInput: '.card-setup-account-info .sup-info-email',
  setupPasswordInput: '.card-setup-account-info .sup-info-password',
  manualConfigButton: '.scrollregion-below-header .sup-manual-config-btn',
  nextButton: '.card-setup-account-info .sup-info-next-btn',
  prefsNextButton: '.card-setup-account-prefs .sup-info-next-btn',
  // -- setup_manual_config
  manualSetupNameInput: '.sup-manual-form .sup-info-name',
  manualSetupEmailInput: '.sup-manual-form .sup-info-email',
  manualSetupPasswordInput: '.sup-manual-form .sup-info-password',
  manualSetupImapUsernameInput:
    '.sup-manual-form .sup-manual-composite-username',
  manualSetupImapHostnameInput:
    '.sup-manual-form .sup-manual-composite-hostname',
  manualSetupImapPortInput: '.sup-manual-form .sup-manual-composite-port',
  manualSetupImapSocket: '.sup-manual-form .sup-manual-composite-socket',
  manualSetupSmtpUsernameInput: '.sup-manual-form .sup-manual-smtp-username',
  manualSetupSmtpHostnameInput: '.sup-manual-form .sup-manual-smtp-hostname',
  manualSetupSmtpPortInput: '.sup-manual-form .sup-manual-smtp-port',
  manualSetupSmtpSocket: '.sup-manual-form .sup-manual-smtp-socket',
  manualNextButton: '.sup-account-header .sup-manual-next-btn',
// XXXX merged in:
  msgDownBtn: '.card-message-reader .msg-down-btn',
  msgListScrollOuter: '.card-message-list .msg-list-scrollouter',
  msgUpBtn: '.card-message-reader .msg-up-btn',
  msgEnvelopeSubject: '.card-message-reader .msg-envelope-subject',
  // -- setup_done
  showMailButton: '.card-setup-done .sup-show-mail-btn',
  // -- compose
  composeButton: '.msg-list-header .msg-compose-btn',
  composeEmailContainer: '.card-compose .cmp-to-container',
  composeEmailInput: '.card-compose .cmp-addr-text',
  composeSubjectInput: '.card-compose .cmp-subject-text',
  composeBodyInput: '.card-compose .cmp-body-text',
  composeSendButton: '.card-compose .cmp-send-btn',
  composeBackButton: '.card-compose .cmp-back-btn',
  composeDraftDiscard: '#cmp-draft-discard',
  composeDraftSave: '#cmp-draft-save',
  // -- message_list
  // note/beware: the search UI is a message_list in a special mode
  refreshButton: '.card-message-list.center .msg-refresh-btn',
  editModeButton: '.card-message-list.center .msg-edit-btn',
  messageListHeader: '.card-message-list.center .msg-list-header',
  editModeHeader: '.card-message-list.center .msg-listedit-header',
  messageHeaderItem: '.msg-messages-container .msg-header-item',
  folderListButton: '.msg-list-header .msg-folder-list-btn',
  editModeDeleteButton: '.card-message-list.center .msg-delete-btn',
  editModeStarButton: '.card-message-list.center .msg-star-btn',
  editModeMarkReadButton: '.card-message-list.center .msg-mark-read-btn',
  // -- message_reader
  cardMessageReader: '.card-message-reader',
  replyMenuButton: '.msg-reply-btn',
  replyMenu: '.msg-reply-menu',
  replyMenuReply: '.msg-reply-menu-reply',
  replyMenuForward: '.msg-reply-menu-forward',
  replyMenuAll: '.msg-reply-menu-reply-all',
  // -- folder_picker
  accountListButton: '.fld-folders-header .fld-accounts-btn',
  settingsButton: '.fld-nav-toolbar .fld-nav-settings-btn',
  emptyTrashButton: '.fld-folder-empty-trash',
  // -- account_picker
  accountItem: '.fld-account-item',
  // -- settings_main
  settingsDoneButton: '.card-settings-main [data-l10n-id="settings-done"]',
  addAccountButton: '.tng-accounts-container .tng-account-add',
  settingsMainAccountItems: '.tng-accounts-container .tng-account-item',
  // -- settings_account
  syncIntervalSelect: '.tng-account-check-interval ',
  // Checkboxes are weird: hidden to marionette, but the associated label
  // is clickable and does the job.
  notifyEmailCheckbox: '.tng-notify-mail-label',
  accountSettingsBackButton: '.card-settings-account .tng-back-btn',
// XXX merge conflict on deletion by my patch
  localDraftsItem: '.fld-folders-container a[data-type=localdrafts]',
  toaster: 'section[role="status"]'
};

Email.prototype = {
  /**
   * Send some emails and then receive them.
   *
   * @param {Array} messages list of messages with to, subject, and body.
   */
  sendAndReceiveMessages: function(messages) {
    messages.forEach(function(message) {
      this.tapCompose();
      this.typeTo(message.to);
      this.typeSubject(message.subject);
      this.typeBody(message.body);
      this.tapSend();
    }.bind(this));

    this.tapRefreshButton();
    this.waitForNewEmail();
    this.tapNotificationBar();
  },

  waitForToaster: function() {
    var toaster = this.client.helper.waitForElement(Selector.toaster);
    this.client.helper.waitForElementToDisappear(toaster);
  },

  get notificationBar() {
    return this.client.findElement(Selector.notificationBar);
  },

  tapNotificationBar: function() {
    this.notificationBar.click();
  },

  get msgDownBtn() {
    return this.client.findElement(Selector.msgDownBtn);
  },

  get msgListScrollOuter() {
    return this.client.findElement(Selector.msgListScrollOuter);
  },

  get msgUpBtn() {
    return this.client.findElement(Selector.msgUpBtn);
  },

  /**
   * @param {boolean} up whether we're advancing up or down.
   */
  advanceMessageReader: function(up) {
    var el = up ? this.msgUpBtn : this.msgDownBtn;
    el.click();
    this.waitForMessageReader();
  },

  getMessageReaderSubject: function() {
    var el = this.client.findElement(Selector.msgEnvelopeSubject);
    return el.text();
  },

  getComposeBody: function() {
    var input = this.client.findElement(Selector.composeBodyInput);
    var value = input.getAttribute('value');
    return value;
  },

  getComposeTo: function() {
    var container = this.client.findElement(Selector.composeEmailContainer);
    var text = container.text();
    return text;
  },

  /**
   * Perform initial setup of one or more accounts.  You will end up on the
   * message_list of the inbox of the
   */
  initialSetup: function(servers) {
    this.manualSetupEmail(servers[0]);
    for (var i = 1; i < servers.length; i++) {
      this.setupAdditionalAccount(servers[i]);
    }
  },

  /**
   * From the messages_list, add another account characterized by a server,
   * ending up back at the message_list when we're done.
   */
  setupAdditionalAccount: function(server) {
    this._assertDisplayingCard('message_list');
    // Now set up second account, to confirm system notifications
    // are only triggered in certain situations.
    this.tapFolderListButton();
    this.tapSettingsButton();
    this.tapAddAccountButton();
    this.manualSetupImapEmail(server);
  },

  /**
   * From the automatic account setup screen, initiate manual setup of an
   * account.
   *
   * @param server
   *   The server created via the
   * @param [finalActionName=waitForMessageList]
   *   The method to invoke to wait for the display of whatever card we expect
   *   to be loaded once the account is created.
   */
  manualSetupEmail: function(server, finalActionName) {
    // make sure we're actually on the automatic account setup screen
    this._assertDisplayingCard('setup_account_info');
    // bring up the manual configuration screen
    this._tapSelector(Selector.manualConfigButton);
    this._waitForTransitionEnd('setup_manual_config');

    // setup a IMAP email account
    var email = server.imap.username + '@' + server.imap.hostname;
    this._manualSetupTypeName(server.imap.username);
    this._manualSetupTypeEmail(email);
    this._manualSetupTypePassword(server.imap.password);

    this._manualSetupTypeImapUsername(server.imap.username);
    this._manualSetupTypeImapHostname(server.imap.hostname);
    this._manualSetupTypeImapPort(server.imap.port);
    this._manualSetupUpdateSocket('manualSetupImapSocket');

    this._manualSetupTypeSmtpUsername(server.smtp.username);
    this._manualSetupTypeSmtpHostname(server.smtp.hostname);
    this._manualSetupTypeSmtpPort(server.smtp.port);
    this._manualSetupUpdateSocket('manualSetupSmtpSocket');

    // Trigger account creation.
    this._finishSetup(Selector.manualNextButton, finalActionName);
  },

  /**
   * Complete the automatic or manual account setup process (where success is
   * assumed), accept all default preferences on the post-creation card, then
   * choose to not create another account, then advance to whatever is next.
   *
   * @param nextSelector
   *   The selector to use to know what 'next' button to hit to create the
   *   account.
   * @param [finalActionName=waitForMessageList]
   *   The method to invoke to wait for the display of whatever card we expect
   *   to be loaded once the account is created.
   */
  _finishSetup: function(nextSelector, finalActionName) {
    // Hit next to trigger the account creation.  Assume it will succeed and
    // wait for the preferences card to show up and be usable.
    this._tapNext(nextSelector, 'setup_account_prefs');
    // Now hit the done button and wait for the "do you want to add another
    // account?" page.
    this._tapNext(Selector.prefsNextButton, 'setup_done');
    // We do not want another account.
    this.client.
      findElement(Selector.showMailButton).
      tap();
    return this[finalActionName || 'waitForMessageList']();
  },

  /**
   * When opened by an activity and no accounts are defined, we will display a
   * system confirmation dialog asking if the user wants to set up an account.
   * This method waits for that dialog and selects the "OK" option to begin the
   * process of setting up an account.
   *
   * This method ends with the (automatic) account setup card visible.
   */
  confirmWantAccount: function() {
    this.client.helper.waitForAlert('not set up to send or receive email');
    // inlined selector since it is specific to the out-of-app confirm
    // dialog found in system/index.html
    this._tapSelector('#modal-dialog-confirm-ok');
    this.client.switchToFrame();
    this.client.apps.switchToApp(Email.EMAIL_ORIGIN);
    // Wait for the automatic account config card to be fully visible.
    this._waitForTransitionEnd('setup_account_info');
  },

  //////////////////////////////////////////////////////////////////////////////
  // Folder / Account List

  /**
   * From the message_list, bring up the folder list and select the (first)
   * folder matching the given spec, tapping it and causing us to display it
   * in the message_list and waiting for the folder slice to have completed
   * any database retrieval and synchronization.
   *
   * @param folderSpec
   */
  switchToFolder: function(folderSpec) {
    this.tapFolderListButton();
    this.tapFolder(folderSpec);
  },

  /**
   * From the message list, bring up the folder list, then the account list,
   * then tap the account identified by the provided folder (switching back
   * to the folder list), then close the folder list (bringing us back to
   * the message list, now displaying the inbox for the selected account),
   * then wait for the folder slice to have completed any database retrieval
   * and synchronization.
   */
  switchToAccount: function(server) {
    this.tapFolderListButton();
    this.tapAccountListButton();
    this.tapAccount(server);
    this.tapFolderListButton();
  },

  tapFolderListButton: function() {
    this._assertDisplayingCard('message_list');
    this._tapSelector(Selector.folderListButton);
    this._waitForTransitionEnd('folder_picker');
  },

  tapFolderListCloseButton: function() {
    this._assertDisplayingCard('folder_picker');
    this._tapSelector(Selector.folderListButton);
    this.waitForMessageList();
  },

  /**
   * Locate a folder based on the provided specifier, tapping it.
   *
   * @param folderSpec
   * @param [folderSpec.type]
   *   Identify the folder by its type.
   * @param [folderSpec.name]
   *   Identify the folder by its name.  Only use this if you explicitly
   *   created the folder with a custom name.  Do not use this for special
   *   folders since those names can and will be localized and we don't want
   *   to break in that case.  Use the type specifier for special folders.
   */
  tapFolder: function(folderSpec) {
    // we set a [data-type=TYPENAME] attribute that we can use
    if (folderSpec.type) {
    }
    // we can perform an XPath query on the folder's text.
    else if (folderSpec.name) {
      var xspec;
      this.client.findElement(xspec, 'xpath').tap();
    }
    else {
      throw new Error('bad folder specifier');
    }
  },

  /**
   * Trigger display of the account picker from the folder picker.  This makes
   * no guarantee that there is actually anything visible in the account list.
   */
  tapAccountListButton: function() {
    this._assertDisplayingCard('folder_picker');
    this._tapSelector(Selector.accountListButton);
    this._waitForTransitionEnd('account_picker');
  },

  /**
   * Return the account item elements, waiting for some to appear if they
   * haven't shown up yet.
   */
  _getAccountItems: function() {
    var accountItems;
    this.client.waitFor(function() {
      accountItems = this.client.findElements(Selector.accountItem);
      return accountItems.length > 0;
    }.bind(this));
    return accountItems;
  },

  /**
   * With the account picker visible, switch to the account associated with
   * the given server.  We will wait for the account to appear if it's not
   * there yet.
   *
   * Note that selecting an account brings us back to the folder_picker and
   * causes an automatic selection and displaying of the inbox for that account.
   */
  tapAccount: function(server) {
    this._assertDisplayingCard('account_picker');

    var accountItems = this._getAccountItems();
    var theAccount = null;
    var accountNames = [];
    for (var i = 0; i < accountItems.length; i++) {
      var accountName = accountItems[i].findElement('.fld-account-name').text();
      accountNames.push(accountName);
      if (accountName.indexOf(server.credentials.username) !== -1) {
        theAccount = accountItems[i];
        break;
      }
    }
    if (!theAccount) {
      assert.ok(
        false,
        'Could not find "' + server.credentials.username + '" in: ' +
          accountNames);
    }

    theAccount.tap();
    this._waitForTransitionEnd('folder_picker');
  },

  tapSettingsButton: function() {
    this.client.
      findElement(Selector.settingsButton).
      tap();
    this._waitForTransitionEnd('settings_main');
  },

  //////////////////////////////////////////////////////////////////////////////
  // Settings

  tapSettingsDoneButton: function() {
    this.client.
      findElement(Selector.settingsDoneButton).
      tap();
    this._waitForTransitionEnd('folder_picker');
  },

  tapSettingsAccountIndex: function(index) {
    var elements = this.client.findElements(Selector.settingsMainAccountItems);
    elements[index].tap();
    this._waitForTransitionEnd('settings_account');
  },

  tapAddAccountButton: function() {
    this.client.
      findElement(Selector.addAccountButton).
      tap();
    this._waitForTransitionEnd('setup_account_info');
  },

  tapNotifyEmailCheckbox: function() {
    this._tapSelector(Selector.notifyEmailCheckbox);
  },

  tapAccountSettingsBackButton: function() {
    this.client.
      findElement(Selector.accountSettingsBackButton).
      tap();
    this._waitForTransitionEnd('settings_main');
  },

  //////////////////////////////////////////////////////////////////////////////
  // Compose

  tapCompose: function() {
    this._tapSelector(Selector.composeButton);
    this.waitForCompose();
  },

  typeTo: function(email) {
    this.client.
      findElement(Selector.composeEmailInput).
      sendKeys(email);
  },

  typeSubject: function(string) {
    this.client.
      findElement(Selector.composeSubjectInput).
      sendKeys(string);
  },

  typeBody: function(string) {
    this.client.
      findElement(Selector.composeBodyInput).
      sendKeys(string);
  },

  getComposeBody: function() {
    return this._waitForElementNoTransition(Selector.composeBodyInput)
           .getAttribute('value');
  },

  abortCompose: function(cardId) {
    this._waitForElementNoTransition(Selector.composeBackButton).tap();
    this._waitForElementNoTransition(Selector.composeDraftDiscard).tap();
    this._waitForTransitionEnd(cardId);
  },

  /**
   * From the compose card, trigger a save of the draft and wait for the draft
   * save to be completed as indicated by all outstanding jobs having been
   * completed.
   */
  saveDraft: function() {
    this._assertDisplayingCard('compose');
    this._waitForElementNoTransition(Selector.composeBackButton).tap();
    this._waitForElementNoTransition(Selector.composeDraftSave).tap();
    this._waitForTransitionEnd('message_list');
  },

  /**
   * Tap the send button and wait for us to #1 return to the message list
   * following successful completion of sending the message and #2 wait for
   * any append/saveSentDraft job/operations to complete.
   */
  tapSend: function() {
    this.client.findElement(Selector.composeSendButton).tap();
    this.waitForMessageList();
    this._waitForAllOpsToComplete();
  },

  //////////////////////////////////////////////////////////////////////////////
  // Message List

  tapRefreshButton: function() {
    this.client.
      findElement(Selector.refreshButton).
      tap();
  },

  /**
   * Wait for the message list card to show up and for any synchronization or
   * message retrieval from the database to occur (via an automatic call to
   * waitForMessageListSynchronized).
   *
   * If you do not want to wait for synchronization to complete then you need
   * to do something clever manually.  Because there are races inherently
   * involved in doing such a thing, I suggest instead doing that testing in
   * a UI unit test where you can avoid races by faking what the slice gets up
   * to.
   */
  waitForMessageList: function() {
    this._waitForTransitionEnd('message_list');
    this.waitForSliceSynchronized();
  },

  /**
   * Wait for the slice backing this message-list to indicate that it has
   * finished performing any requested growth or synchronization.  This is
   * automatically called by 'waitForMessageList'; you really only need to
   * manually call this if you are doing things like scrolling the message
   * list or triggering growth-triggered synchronization.
   *
   * Note: This directly introspects the app state; just looking at the state
   * of the refresh button and whether it is spinning is not sufficient.
   *
   * @param [expectedEndState='synced']
   *   The state we expect the slice to end up in.  By default, this is 'synced'
   *   indicating a successful sync.  'syncfailed' is the other potential
   *   end state.
   */
  waitForMessageListSynchronized: function(expectedEndState) {
    var client = this.client;
    client.waitFor(function() {
      return client.executeScript(function() {
        var Cards = window.wrappedJSObject.require('mail_common').Cards,
            cardImpl = Cards._cardStack[Cards.activeCardIndex].cardImpl;
        if (!cardImpl.messagesSlice ||
            cardImpl.messagesSlice !== expectedEndState) {
          return false;
        }
        return true;
      });
    });
  },

  /**
   * Wait for the message reader card to be displayed and us not to be eating
   * events AND waits for the body to be fully fetched/displayed before
   * returning.  So the spinner will be gone by the time we return.  If you want
   * to look at the DOM while the spinner is present, etc. write a UI unit test
   * or do something more clever/dangerous than this.
   */
  waitForMessageReader: function() {
    this._waitForTransitionEnd('message_reader');
    this._waitForCardInstanceBoolean('message_reader', 'fullyDisplayed', true);
  },

  /**
   * Wait for the compose card to be fully displayed and for the composer to
   * indicate that it is fully initialized by directly introspecting the card
   * state.
   *
   * There are 2 different ways the compose card can be triggered, which are
   * very different but both require us to wait for the state indication:
   *
   * 1) With a fully initialized MessageComposition instance.  This is the case
   *    when editing a draft or replying to/forwarding a message.  We only push
   *    the card once the composer has been initialized.  All compose mutation
   *    actions can be taken and the DOM is *probably* initialized.
   *    Unfortunately we dynamically load iframe_shims, so there can be a delay
   *    before we reflect state into the DOM.
   *
   * 2) Without a MessageComposition instance.  We wait for both the
   *    iframe_shims to load, for the model.latestOnce('folder') to be reported,
   *    and then for the composition context to be created.  At the time of
   *    writing, an empty composition context will not actually change the DOM,
   *    but that will potentially change in the future when we show the current
   *    sender identity in use.
   */
  waitForCompose: function() {
    this._waitForTransitionEnd('compose');
    this._waitForCardInstanceBoolean('compose', 'ready', true);
  },

  /**
   * Wait for new messages to be reported in the current folder based on the
   * appearance of the blue bar header.  New messages are unread messages that
   * are newer than the most recent known message in the folder.
   */
  waitForNewEmail: function() {
    this._waitForElementNoTransition(Selector.notificationBar);
  },

  launch: function() {
    var client = this.client;
    client.apps.launch(Email.EMAIL_ORIGIN);
    client.apps.switchToApp(Email.EMAIL_ORIGIN);
    // wait for the document body to know we're really launched
    client.helper.waitForElement('body');
  },

  close: function() {
    var client = this.client;
    client.apps.close(Email.EMAIL_ORIGIN);
  },

<<<<<<< HEAD
  getHeaderAtIndex: function(index) {
=======
  /**
   * Enter edit mode and perform the requested operation on the given messages
   * using their header.  This method triggers edit mode from the message_list,
   * selects the messages, and triggers the operation, which exits edit mode
   * and returns us to the message_list.
   *
   * @param operation {'delete'|'star'|'unstar'|'read'|'unread'}
   *   The operation to perform.  Moving messages is currently not supported.
   *   Note that star/unstar and read/unread are toggle options based on
   *   the current state of the selected messages.  The star button stars
   *   messages if any of the selected messages are not starred, otherwise it
   *   unstars all the messages.  The read button marks messages unread if any
   *   of the messages is read, otherwise it marks all the messages read.  You
   *   need to pass what you expect the net result will be so we can generate
   *   the right assertion.
   * @param matchSpec
   *   See MailDOMMessageList.match.
   *
   * Example:
   *
   *     // Delete the message with the subject and the message bar
   *     batchEditMessages('delete', { subjects: ['foo', 'bar'] });
   */
  batchEditMessages: function(operation, filterSpec) {
    this.tapEnterEditMode(); // asserts we're on the message_list for us

    var messages = this.getMessagesInMessageList().filter(filterSpec);

    // - hit the button
    var opSelector;
    switch (operation) {
      case 'delete':
        this._tapSelector(Selector.editModeDeleteButton);
        // the messages should disappear from the list
        messages.tapAll();
        messages.waitForMessagesToDisappear();
        break;
      case 'star':
        this._tapSelector(Selector.editModeFlagButton);
        messages.waitForMessagesToBecomeStarred();
        break;
      case 'unstar':
        this._tapSelector(Selector.editModeFlagButton);
        messages.waitForMessagesToBecomeUnstarred();
        break;
      case 'read':
        this._tapSelector(Selector.editModeMarkReadButton);
        messages.waitForMessagesToBecomeRead();
        break;
      case 'unread':
        this._tapSelector(Selector.editModeMarkReadButton);
        messages.waitForMessagesToBecomeUnread();
        break;
    }

    // - wait for us to transition out of edit mode
    this.client.helper.waitForElementToDisappear(Selector.messageListHeader);
    this._assertNotDisplayed(Selector.editModeHeader);

    // - wait for the results to become apparent
    switch (operation) {
      case 'delete':

        break;
      case 'star':
        break;
      case 'read':
        break;
    }


  },

  /**
   * When on the message_list card, tap edit mode to transition to edit mode
   * and verify we made the transition by an appropriate change in header
   * visibility.
   */
  tapEnterEditMode: function() {
    this._assertDisplayingCard('message_list');
    this._tapSelector(Selector.editModeButton);
    // Wait for us to transition to edit mode as indicated by the header
    // becoming visible.
    this.client.helper.waitForElement(Selector.editModeHeader);
    // (And so the message list header should not be visible.)
    this._assertNotDisplayed(Selector.messageListHeader);
  },

  tapEmailAtIndex: function(index) {
>>>>>>> d2f3211... test improvements
    var client = this.client;
    var elements = client.findElements(Selector.messageHeaderItem);
    return elements[index];
  },

  tapEmailAtIndex: function(index) {
    var element = this.getHeaderAtIndex(index);
    element.tap();
    this.waitForMessageReader();
  },

  tapEmailBySubject: function(subject, cardId) {
    // The emails may not be present in the list yet.  So keep checking until
    // we see one.  Then tap on it.
    var element;
    this.client.waitFor(function() {
      element = this.getEmailBySubject(subject);
      if (!element)
        return false;

      element.tap();
      this._waitForTransitionEnd(cardId);
      return true;
    }.bind(this));

    return element;
  },

  /**
   * Locate and return
   */
  getEmailBySubject: function(subject) {
    // XXX we could potentially be more efficient about this by using an XPath
    // query.
        messageHeadersLength = messageHeaders.length,
        element;

    for (var i = 0; i < messageHeadersLength; i++) {
      if (messageHeaders[i].
            findElement('.msg-header-subject').
            text() === subject) {
        element = messageHeaders[i];
      }
    }
    return element;
  },

  /**
   *
   */
  getMessagesInMessageList: function() {
    var messageHeaders = this.client.findElements(Selector.messageHeaderItem);
    return new MailDOMMessageList(this.client, messageHeaders);
  },

  /**
   * On a message_list card, assert that messages with the given subjects are
   * present in the DOM.  Note that with buffering and such that being in the
   * database does not mean the same thing as in the DOM!
   */
  assertMessagesPresentInList: function(subjects) {
  },

  //////////////////////////////////////////////////////////////////////////////
  // Message Reader

  /**
   * Opens the reply menu and selects 'reply', 'all', or 'forward'.
   */
  tapReply: function(mode) {
    var client = this.client;
    // open the reply menu
    client.findElement(Selector.replyMenuButton).tap();
    client.helper.waitForElement(Selector.replyMenu);
    // select the appropriate option
    var whichButton;
    switch (mode) {
    case 'all':
      whichButton = Selector.replyMenuAll;
      break;
    case 'forward':
      whichButton = Selector.replyMenuForward;
      break;
    case 'reply':
    default:
      whichButton = Selector.replyMenuReply;
      break;
    }
    client.findElement(whichButton).tap();
    this._waitForTransitionEnd('compose');
  },

  setSyncIntervalSelectValue: function(value) {
    return this._setSelectValue(Selector.syncIntervalSelect, value);
  },

  // TODO: switch to https://github.com/mozilla-b2g/marionette-plugin-forms
  // once this bug is fixed:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=915324
  _setSelectValue: function(selector, value) {
    var client = this.client;
    client.waitFor(function() {
      return client.executeScript(function(selector, value) {
        var doc = window.wrappedJSObject.document,
            selectNode = doc.querySelector(selector);

        selectNode.value = value;

        // Synthesize an event since changing the value on its own does
        // not trigger change listeners.
        var event = document.createEvent('Event');
        event.initEvent('change', true, true);
        selectNode.dispatchEvent(event);

        return true;
      }, [selector, value]);
    });
  },

  _onTransitionEndScriptTimeout: function(cardId) {
    var result = this.client.executeScript(function(cardId) {
      var Cards = window.wrappedJSObject.require('mail_common').Cards,
          card = Cards._cardStack[Cards.activeCardIndex],
          cardNode = card && card.domNode;

      return {
        cardNode: !!cardNode,
        centered: cardNode && cardNode.classList.contains('center'),
        correctId: cardNode && cardNode.dataset.type === cardId,
        eventsClear: !Cards._eatingEventsUntilNextCard
      };
    }, [cardId]);

    console.log('TRANSITION END TIMEOUT:');
    console.log(JSON.stringify(result, null, '  '));
  },

  /**
   * Assert that we are already fully displaying the given card.  If this
   * throws, it means that you did not use _waitForTransitionEnd.  This
   * is potentially redundant, but tests have already failed to account
   * for things like this before, so let's go coconuts!
   */
  _assertDisplayingCard: function(expectedCardId) {
    var currentCardId = this.client.executeScript(function() {
      var Cards = window.wrappedJSObject.require('mail_common').Cards,
          card = Cards._cardStack[Cards.activeCardIndex],
          cardId = card.cardDef.name;
      if (Cards._eatingEventsUntilNextCard)
        cardId = 'still-animating:' + cardId;
      return cardId;
    });
    assert.equal(currentCardId, expectedCardId,
                 'not fully displaying: ' + expectedCardId + '!');
  },

  /**
   * Wait for a property on the current card's instance to take on the given
   * value.  This is an attempt to be a good hack to deal with asynchronous
   * situations where there is a short window of time when a card is not fully
   * done doing something but we expect the window to be short enough that the
   * user would not notice and it would be distracting/bad for us to show some
   * UI affordance to indicate we are thinking.
   *
   * The 'good hack' idea is that expressing this on a property on the JS
   * object could be useful to someone later debugging the app or some quick
   * console.log's getting thrown into the code-base.  We could potentially
   * also just put the value in the dataset too (which would allow for DOM
   * mutation event-based triggering, although once we have Object.observe we
   * could use that for triggering too.)
   *
   * For example, the compose card may take a few extra moments to fully
   * initialize itself.  We intentionally do this so that we can be more
   * responsive to the user triggering the compose activity and try and have
   * most of the initialization occur during the transition animation, but we
   * can't make a 100% guarantee that works, especially if we shorten the
   * transition times to speed up our tests!
   *
   * @param cardId
   *   The type of the card instance we expect to be the current card.  Named
   *   for sanity checking purposes.  You should already have used
   *   _waitForTransitionEnd to make sure the card is fully visible.  At some
   *   point in the future we may fail fast if we are not on the card we
   *   expect.
   * @param propertyName
   *   The property name (no nested paths, etc.!) to check the value of.
   * @param expectedValue
   *   The expected simple value; === comparisons are used.
   */
  _waitForCardInstanceProperty: function(cardId, propertyName, expectedValue) {
    var client = this.client;
    client.waitFor(function() {
      return client.executeScript(function(cardId, prop, value) {
        var Cards = window.wrappedJSObject.require('mail_common').Cards,
            card = Cards._cardStack[Cards.activeCardIndex];
        if (card.cardDef.name !== cardId)
          throw new Error('card mismatch!');

        var cardImpl = card.cardImpl;
        return (cardImpl[prop] === value);
      }, [cardId, propertyName, expectedValue]);
    });
  },

  /**
   * Wait for the given card to be displayed and fully usable.  This means
   * the card is the active card and we are no longer eating events.
   */
  _waitForTransitionEnd: function(cardId) {
    var client = this.client;

    // To find out what is wrong with an intermittent failure in here,
    // log the script test criteria
    client.onScriptTimeout = this._onTransitionEndScriptTimeout
                                 .bind(this, cardId);

    client.waitFor(function() {
      return client.executeScript(function(cardId) {
        var Cards = window.wrappedJSObject.require('mail_common').Cards,
            card = Cards._cardStack[Cards.activeCardIndex],
            cardNode = card && card.domNode;

        return !!cardNode && cardNode.classList.contains('center') &&
               cardNode.dataset.type === cardId &&
               !Cards._eatingEventsUntilNextCard;
      }, [cardId]);
    });

    client.onScriptTimeout = null;
  },

  /**
   * Helper function used by _waitForTransitionEnd and _waitForNoTransition to
   * ideally report some info on the state of the app at failure time.
   */
  _onNoTransitionScriptTimeout: function() {
    var result = this.client.executeScript(function() {
      var Cards = window.wrappedJSObject.require('mail_common').Cards;

      return {
        cards: !!Cards,
        eventsClear: !!Cards && !Cards._eatingEventsUntilNextCard
      };
    });

    console.log('NO TRANSITION TIMEOUT:');
    console.log(JSON.stringify(result, null, '  '));
  },

  /**
   * Wait for any active card animation to terminate as indicated by
   * Cards._eatingEventsUntilNextCard going false.  _waitForTransitionEnd
   * with an explicit card name is probably a better choice in general
   * since you can then make sure you're on the right card too.
   */
  _waitForNoTransition: function() {
    var client = this.client;

    // To find out what is wrong with an intermittent failure in here,
    // log the script test criteria
    client.onScriptTimeout = this._onNoTransitionScriptTimeout
                                 .bind(this);

    client.waitFor(function() {
      return client.executeScript(function() {
        var Cards = window.wrappedJSObject.require('mail_common').Cards;
        return !Cards._eatingEventsUntilNextCard;
      });
    });

    client.onScriptTimeout = null;
  },

  /**
   * Assert that the thing identified by the selector is currently displayed
   * without waiting for it to show up.  Use client.helper.waitForElement
   * if you just want it to happen eventually.
   *
   * We use Marionette's displayed() mechanism which is isElementDisplayed
   * inside the Gecko back-end but bottoms out in Selenium's bot.dom.isShown
   * atom.  Look in
   * http://selenium.googlecode.com/svn/trunk/javascript/atoms/dom.js for more
   * details on how that works.
   */
  _assertDisplayed: function(selector) {
    assert.ok(this.client.findElement(selector).displayed());
  },

  /**
   * Assert that the thing identified by the selector is not currently
   * displayed.  Use client.helper.waitForElementToDisappear if you just want
   * it to disappear eventually.
   */
  _assertNotDisplayed: function(selector) {
    assert.ok(!this.client.findElement(selector).displayed());
  },

  /**
   * Helper method to wait for a class to be removed
   */
  _waitForClassToDisappear: function(element, subElemSelector, byeClass) {
  },

  _setupTypeName: function(name) {
    this.client.
      findElement(Selector.setupNameInput).
      sendKeys(name);
  },

  _setupTypeEmail: function(email) {
    this.client.
      findElement(Selector.setupEmailInput).
      sendKeys(email);
  },

  _setupTypePassword: function(password) {
    this.client.
      findElement(Selector.setupPasswordInput).
      sendKeys(password);
  },

  _waitForElementNoTransition: function(selector) {
    this._waitForNoTransition();
    return this.client.helper.waitForElement(selector);
  },

  /**
   * Wait for the selector to appear, then tap on it.  In general this is not
   * required in our card-centric implementation since if the card is there,
   * then everything in the card is there too.  (The exception is for lists
   * of things that come from the back-end, but in that case a simple selector
   * isn't going to work for you.)
   */
  _tapSelector: function(selector) {
    this.client.helper.waitForElement(selector);
    this.client.findElement(selector).tap();
  },

  _tapNext: function(selector, cardId) {
    this._tapSelector(selector);
    if (cardId)
      this._waitForTransitionEnd(cardId);
  },

  _manualSetupTypeName: function(name) {
    this.client.
      findElement(Selector.manualSetupNameInput).
      sendKeys(name);
  },

  _manualSetupTypeEmail: function(email) {
    this.client.
      findElement(Selector.manualSetupEmailInput).
      sendKeys(email);
  },

  _manualSetupTypePassword: function(password) {
    this.client.
      findElement(Selector.manualSetupPasswordInput).
      sendKeys(password);
  },

  _manualSetupTypeImapUsername: function(name) {
    this.client.
      findElement(Selector.manualSetupImapUsernameInput).
      sendKeys(name);
  },

  _manualSetupTypeImapHostname: function(hostname) {
    this.client.
      findElement(Selector.manualSetupImapHostnameInput).
      sendKeys(hostname);
  },

  _manualSetupTypeImapPort: function(port) {
    var manualSetupImapPortInput =
        this.client.findElement(Selector.manualSetupImapPortInput);
    manualSetupImapPortInput.clear();
    manualSetupImapPortInput.sendKeys(port);
  },

  _manualSetupTypeSmtpUsername: function(name) {
    this.client.
      findElement(Selector.manualSetupSmtpUsernameInput).
      sendKeys(name);
  },

  _manualSetupTypeSmtpHostname: function(hostname) {
    this.client.
      findElement(Selector.manualSetupSmtpHostnameInput).
      sendKeys(hostname);
  },

  _manualSetupTypeSmtpPort: function(port) {
    var manualSetupSmtpPortInput =
        this.client.findElement(Selector.manualSetupSmtpPortInput);
    manualSetupSmtpPortInput.clear();
    manualSetupSmtpPortInput.sendKeys(port);
  },

  /**
   * Because we never expose "plain" (zero security for users) as an option we
   * need to hack the html to expose it (the backend will know about this).
   */
  _manualSetupUpdateSocket: function(type) {
    var element = this.client.findElement(Selector[type]);

    // select is a real dom select element
    element.scriptWith(function(select) {
      // create the option
      var option = document.createElement('option');
      option.value = 'plain';
      select.add(option, select.options[select.options.length - 1]);

      // update the form to plain so we can use insecure sockets for the
      // fakeserver.
      select.value = 'plain';
    });
  }
};

require('./debug')('email', Email.prototype);

