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

  this._client.recorderHelper.on('fill-in-failure-details',
                                 this._fillInFailureDetails.bind(this));
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
  var useMode = opts.mode || 'default';
  var pushPattern = {
    w: 'cards.push',
    type: opts.type,
    mode: useMode
  };
  var showPattern = {
    w: 'cards.show:complete',
    type: opts.type,
    mode: useMode
  };
  // The patterns to wait for IN SEQUENCE (AND not OR).
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
  if (!cardInfo) {
    throw new Error('No card info available from the remote side for card #' +
                    cardIndex);
  }
  if (cardInfo.type !== opts.type) {
    throw new Error('Expected "' + opts.type + '" card but got "' +
                    cardInfo.type + '" card');
  }

  return this._wrapCardWithHelper(opts.type, useMode, cardInfo.domNode);
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
  var rawResult = this._client.executeScript(function(index) {
    var Cards = window.wrappedJSObject.requirejs('mail_common').Cards;
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
  // _executeScript doesn't recursively transform, so we need to manually wrap
  // the element.
  if (rawResult && rawResult.domNode) {
    rawResult.domNode = new this._client.Element(rawResult.domNode.ELEMENT,
                                                 this._client);
  }
  return rawResult;
};

/**
 * Get the current list of cards on the client.
 */
CardDealer.prototype._getCardList = function() {
  var rawResults = this._client.executeScript(function() {
    var Cards = window.wrappedJSObject.requirejs('mail_common').Cards;
    return Cards._cardStack.map(function(cardInst) {
      return {
        type: cardInst.cardDef.name,
        mode: cardInst.modeDef.name,
        domNode: cardInst.domNode
      };
    });
  });
  // wrap all the element UUID handles into proper Marionette.Element instances
  rawResults.forEach(function(raw) {
    raw.domNode = new this._client.Element(raw.domNode.ELEMENT, this._client);
  }.bind(this));
  return rawResults;
};

CardDealer.prototype._wrapCardWithHelper = function(type, mode, domNode) {
  var constructor = require('./' + type);
  if (typeof(constructor) !== 'function') {
    throw new Error('The cardhelper module for ' + type +
                    ' is not a function!');
  }
  var helper = new constructor({
    client: this._client,
    helpers: this._helpers,
    domNode: domNode,
    mode: mode
  });
  return helper;
};

/**
 * Interrogate the client to get the list of active cards, then wrap each of
 * those cards in a helper and use them to extract the state of each of those
 * cards.
 */
CardDealer.prototype.extractAllCardStates = function() {
  var cardInfos = this._getCardList();

  var cardInfoAndStates = cardInfos.map(function(cardInfo) {
    try {
      var helper = this._wrapCardWithHelper(cardInfo.type, cardInfo.mode,
                                            cardInfo.domNode);
      return {
        type: cardInfo.type,
        mode: cardInfo.mode,
        state: helper.getUIState()
      };
    }
    catch(ex) {
      return {
        type: cardInfo.type,
        mode: cardInfo.mode,
        state: null,
        error: {
          name: ex.name,
          message: ex.message,
          stack: ex.stack
        }
      };
    }
  }.bind(this));

  return cardInfoAndStates;
};

CardDealer.prototype._fillInFailureDetails = function(details) {
  details.cards = this.extractAllCardStates();
};

module.exports = CardDealer;
