var server = require('mail-fakeservers');

/**
 * Updates given object with the state from an imapStack.
 *
 * @param {Object} state target.
 * @param {Object} stack to pull updates from.
 * @param {Object} options for setup.
 */
function updateState(state, stack, options) {
  switch (options.type) {
    case 'imap':
      state.receive = {
        type: 'imap',
        port: stack.imapPort
      };
      break;
    case 'pop3':
      state.receive = {
        type: 'pop3',
        port: stack.pop3Port
      };
      break;
  }
  state.send = {
    type: 'smtp',
    port: stack.smtpPort
  };

  [state.receive, state.send].forEach(function(serverState) {
    serverState.username = options.credentials.username;
    serverState.password = options.credentials.password;
    serverState.hostname = 'localhost';
  });
}

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
   * @type {Object}
   * @private
   */
  var state = {
    credentials: options.credentials
  };

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
      updateState(state, _serverStack, options);

      serverStack = _serverStack;
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

  return state;
}

module.exports.use = use;
