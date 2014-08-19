/**
 * Help fake an autoconfig situation and control its async nature.
 *
 * In order to be able to test the autoconfig-based account setup mechanism we
 * either need some way to tell the back-end about the fake-server we have
 * created OR make it look like we told the back-end about it.
 *
 * Rough set of options for realistic back-end behaviour:
 * 1: Poke the dictionary into accountcommon.js's autoconfigByDomain (in the
 *    worker)
 * 2: Somehow have crammed the file into our app zip / filesystem location
 * 3: Have a real server at the given domain up on port 80 for standard
 *    autoconfig.
 * 4: Use fake/mocked XHR to server the autoconfig (on the worker!)
 *
 * The option for fake back-end behaviour:
 * A: Just swap out MailAPI.tryToCreateAccount with one that includes our
 *    fully populated domainInfo object.
 *
 * We additionally hold onto the actual call until `releaseFakeAutoconfig` is
 * invoked below so that we can control the life-cycle of the card.
 */
exports.prepareFakeAutoconfig = function(client, domainInfo) {
  client.executeScript(function(fakeDomainInfo) {
    var MailAPI = window.wrappedJSObject.MailAPI;
    // If someone is debugging things, make it REAL obvious that we're messing
    // with things by having an explicit attribute over us calling the
    // prototype, etc. for the time we're alive.
    MailAPI._realTryToCreateAccount = MailAPI.tryToCreateAccount;
    MailAPI.tryToCreateAccount = function(details, realDomainInfo, callback) {
      MailAPI._savedCreateCallArgs = [details, fakeDomainInfo, callback];
    };
  }, [domainInfo]);
};

exports.releaseFakeAutoconfig = function(client) {
  client.executeScript(function() {
    var MailAPI = window.wrappedJSObject.MailAPI;
    var args = MailAPI._savedCreateCallArgs;
    MailAPI._savedCreateCallArgs = null;
    MailAPI._realTryToCreateAccount(args[0], args[1], args[2]);
    // remove the wrapping
    MailAPI.tryToCreateAccount = MailAPI._realTryToCreateAccount;
    MailAPI._realTryToCreateAccount = null;
  }, []);
};
