'use strict';

/**
 * This exceedingly cleverly named helper handles all the interaction with
 * mail_common.js's Cards abstraction.
 *
 * We consume logs for our asynchronous-waiting-for-stuff-to-happen needs.  (The
 * alternative would be polling for state changes or registering for events in
 * the page.  But neither of those help us ensure we have useful logs.)
 */
function CardDealer(client) {
  this._client = client;
}

/**
 * Synchronously wait for the given card to be pushed.
 *
 * @param {Object} opts
 * @param {String} opts.type
 *   Card type
 * @param {String} [opts.mode="default"]
 *   Card mode
 * @param {String} opts.waitForLog
 *   A log event name to wait for, for example
 */
CardDealer.prototype.waitForAndWrapNewCard = function(opts) {
};

CardDealer.prototype._getCard = function(index) {
  return this._client.executeScript(function(index) {
    var Cards = window.require('mail_common').Cards;
    var cardInst = Cards._cardStack[index];
    return {
      type: cardInst.cardDef.name,
      mode: cardInst.modeDef.name,
      domNode: cardInst.domNode
    };
  }, [index]);
};

/**
 * Get the current list of cards on the client.
 */
CardDealer.prototype._getCardList = function() {
  return this._client.executeScript(function() {
    var Cards = window.require('mail_common').Cards;
    return Cards._cardStack.map(function(cardInst) {
      return {
        type: cardInst.cardDef.name,
        mode: cardInst.modeDef.name,
        domNode: cardInst.domNode
      };
    });
  });
};

CardDealer.prototype._wrapCardWithHelper = function(type, domNode) {
  var constructor = require('./' + type);
  var helper = new constructor({
    client: this._client,
    domNode: domNode
  });
  return helper;
};

/**
 * Interrogate the client to get the list of active cards, then wrap each of
 * those cards in a helper and use them to extract the state of each of those
 * cards.
 */
CardDealer.prototype.extractAllCardStates = function() {
  var cardInsts = this._getCardList();

};
