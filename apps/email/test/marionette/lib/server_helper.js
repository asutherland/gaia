/**
 * Primary interface to expose server details to tests. Internally abstracts the
 * details of what kind of server (aside from general protocol) so we can also
 * use fake servers.
 */


/**
 * Example interface for server setup.
 *
 *    var serverAccount = require('exported_module').use(options, this);
 *
 *    // details about our hypothetical person
 *    serverAccount.displayName
 *    serverAccount.emailAddress
 *
 *    // general credentials
 *    serverAccount.credentials.username
 *    serverAccount.credentials.password
 *
 *    // example imap or pop3 interface
 *    serverAccount.receive.type === 'imap';
 *    serverAccount.receive.port
 *    serverAccount.receive.username
 *    serverAccount.receive.hostname
 *    serverAccount.receive.password
 *
 *    // example imap or pop3 interface
 *    serverAccount.send.port
 *    serverAccount.send.username
 *    serverAccount.send.hostname
 *    serverAccount.send.password
 *
 *    While the "port" may be optional (you might need a url instead)
 *    username/password should always be included.
 *
 */
//function serverSetup(options) {};

/**
 * Expose a server lifecycle to a given test.
 *
 *    marionette('xfoo', function() {
 *      require('./lib/server_helper').use({}, this);
 *    });
 *
 * @param {Object} [options] for server. defaults to a sane IMAP setup.
 * @param [options.type]
 * @param [options.credentials]
 * @param {Object} mochaContext
 *   (usually the |this| of a marionette/suite block).
 */
function determineServer(options, mochaContext) {
  if (!options) {
    options = {
      displayName: 'Test User',
      emailAddress: 'testy@localhost'
    };
  }

  if (!options.credentials) {
    options.credentials = {
      username: 'testy',
      password: 'testy'
    };
  }

  // if you don't care, you get IMAP.
  if (!options.type) {
    options.type = 'imap';
  }

  // We only support the mail-fakeservers family of fake servers right now.
  return require('./servers/fakemail').use(options, mochaContext);
}

module.exports.use = determineServer;
