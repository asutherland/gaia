/*jshint node: true, browser: true */
'use strict';

/**
 * This exceedingly cleverly named helper handles all the interaction with
 * mail_common.js's Cards abstraction.
 *
 * We consume logs for our asynchronous-waiting-for-stuff-to-happen needs.  (The
 * alternative would be polling for state changes or registering for events in
 * the page.  But neither of those help us ensure we have useful logs.)
 */
function CardDealer(client, helpers) {
  this._client = client;
  this._helpers = helpers;
}

/**
 * Synchronously wait for the given card to be pushed.
 *
 * @param {Object} opts
 * @param {String} opts.type
 *   Card type
 * @param {String} [opts.mode="default"]
 *   Card mode
 * @param {Object} opts.waitForLog
 *   A log object pattern to wait for after the card shows up.
 * @param {Boolean} [opts.cardsReset=false]
 *   If true, we should expect that all cards were completely removed and that
 *   this new card being added is basically the only card being displayed.  We
 *   currently do not assert on the set of visible cards being just the new one.
 */
CardDealer.prototype.waitForAndWrapNewCard = function(opts) {
  var pushPattern = {
    w: 'cards.push',
    type: opts.type,
    mode: opts.mode || 'default'
  };
  var showPattern = {
    w: 'cards.show:complete',
    type: opts.type,
    mode: opts.mode || 'default'
  };
  var patterns = [pushPattern, showPattern];
  if (opts.waitForLog) {
    patterns.push(opts.waitForLog);
  }
  if (opts.cardsReset) {
    patterns.unshift({
      w: 'cards.removeCardAndSuccessors',
      toRemove: 'all'
    });
  }

  var logMatches = this._helpers.log.waitForLogMatching(patterns);
  var cardIndex = logMatches[patterns.indexOf(showPattern)].index;
  var cardInfo = this._getCardInfoByIndex(cardIndex);
  if (!cardInfo || cardInfo.type !== opts.type) {
    throw new Error('Card was not remotely what I expected!');
  }

  return this._wrapCardWithHelper(opts.type, cardInfo.domNode);
};

/**
 * Synchronously wait for an existing card to be shown / transitioned to.
 *
 * @param {CardHelper} opts.card
 *   The card that should be shown.
 */
CardDealer.prototype.waitForExistingCardToBeShown = function(opts) {
  var showPattern = {
    w: 'cards.show:complete',
    type: opts.card.type,
    mode: opts.card.mode
  };

  this._helpers.log.waitForLogMatching(showPattern);
};

/**
 * Wait for the current card to be removed and us to transition to some other
 * existing card.
 *
 * @param {CardHelper} opts.removed
 * @param {CardHelper} opts.returnTo
 */
CardDealer.prototype.waitForCardToBeRemovedAndUsToReturnTo = function(opts) {
  var removePattern = {
    w: 'cards.killing',
    type: opts.removed.type,
    mode: opts.removed.mode
  };
  var showPattern = {
    w: 'cards.show:complete',
    type: opts.returnTo.type,
    mode: opts.returnTo.mode
  };

  this._helpers.log.waitForLogMatching([removePattern, showPattern]);
};

/**
 * Extract the type/mode/domNode for the card at the given index on the client.
 */
CardDealer.prototype._getCardInfoByIndex = function(index) {
  return this._client.executeScript(function(index) {
    var Cards = window.require('mail_common').Cards;
    var cardInst = Cards._cardStack[index];
    if (!cardInst) {
      return null;
    }
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
    helpers: this._helpers,
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

module.exports = CardDealer;
