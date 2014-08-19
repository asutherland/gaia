/*jshint node: true, browser: true */
'use strict';

/**
 * Identify and characterize a UI element that can be tapped/clicked to trigger
 * some behaviour.  Always found in an object dictionary where the key is the
 * name of the item.
 *
 * @typedef {Object} WisDOMAction
 * @property {String} desc
 *   Description of the DOM node / action that triggers when tapped
 * @property {String} selector
 *   The CSS selector to use to identify the DOM element.  The selector only
 *   needs to be specific enough to identify the node within its enclosing
 *   context, usually a card, so leave off excess selectors.  This selector also
 *   MUST be specific enough so that exactly one item is returned.  It is an
 *   error for more than 1 item to be returned.
 */

/**
 * Identify and characterize a UI element that displays meaningful object state
 * in the UI.  This handles both straightforward single items and things that
 * may be repeated such as e-mail attachments.  In the single case, if the
 * display item is also an action item, that should be declared as a
 * WisDOMAction.  In the multiple case, actions can also be hung off the items.
 *
 * Like WisDOMActions, these are always found in an object dictionary and their
 * keys are their names.
 *
 * @typedef {Object} WisDOMDisplay
 * @property {String} desc
 *   Description of the DOM node / the content it displays
 * @property {String} selector
 *   The CSS selector to use to identify the DOM element.  The selector only
 *   needs to be specific enough to identify the node within its enclosing
 *   context, usually a card, so leave off excess selectors.  The selector also
 *   MUST be specific enough so that exactly one item is returned.  It is an
 *   error for more than 1 item to be returned.
 *
 *   Multiple WisDOMDisplay items may use the same selector since multiple
 *   states may be expressed on a single DOM item or multiple checks may be
 *   required.
 * @property {String} [value]
 *   Explains how to extract the value we care about.  This should be present
 *   unless `arrayOfStuff` is present.  If the textContent of the node is the
 *   state then "text" should be specified.  If an attribute should be present
 *   then "@attributeName" should be used.  If a CSS class should be present
 *   then ".className" should be used.  If an attribute or class should not be
 *   present then they should be prefixed with an "!".  So "!@attributeName" or
 *   "!.className".
 * @property {WisDOMDef} arrayOfStuff
 *   Use for repeated DOM elements corresponding to multiple conceptual objects.
 *   For example, e-mail attachments or e-mail addresses.  When used, the
 *   `selector` here on this object is used with `arrayOfStuff.selector`.  For
 *   example, in the e-mail app we create the same type of DOM node to display
 *   e-mail addresses for both "to" and "cc" types, so they would have the
 *   same `arrayOfStuff.selector`.  But the `selector` on this object would
 *   be used to select the container node for "to" or "cc" as appropriate.
 */

/**
 * @typedef {Object} WisDOMDef
 * @property {Object} [prototype]
 *   The Object prototype to mix helper logic into; only used by the mixin
 *   helper function for top-level definitions.  Don't use for `arrayOfStuff`
 *   and `popups` cases.
 * @property {String} [selector]
 *   Used in the `arrayOfStuff` case to identify the multiple repeated elements.
 *   Should not be present in other cases.
 * @property {Object.<String, WisDOMAction>} [actions]
 *   A dictionary whose values are the names of actions and the values are
 *   `WisDOMAction` definitions.  The names are used to create the helper
 *   methods that get mixed into the base-class.
 * @property {Object.<String, WisDOMAction>} [inputs]
 *   A dictionary whose values are the name of form fields/inputs and the values
 *   are definitions that identify the node in question.
 * @property {Object.<String, WisDOMDisplay} [displays]
 *   A dictionary whose values are the name of display items and the values are
 *   `WisDOMDisplay` definitions.  The names are used as the correspoding key
 *   names to be used when discussing the displayed UI state.
 * @property {Object.<String, WinDOMDef>} [popups]
 *   A dictionary whose values are the name of popups and the values are
 *   `WisDOMDef` objects (which is our type!).  The name is used to create
 *   helpers.  Explicit popup support is provided to avoid having to create
 *   separate helper classes for popups and since the coupling is usually high.
 *   This also lets us provide a convenience helper for using the popup.
 */

var assert = require('assert');

/**
 * This function is run in the client context to extract state from the DOM
 * given a `WisDOMDef`.  While the same thing could be done by using the
 * Marionette bindings, this has the serious advantage that we coherently
 * checkpoint state.  A lesser but still significant advantage is that it's
 * likely much faster given that we avoid a serious number of network roundtrips
 * and context switches.
 */
function extractState_inClientContent(root, wisdef) {
  function process(root, wisdef) {
    var uiState = {};
    var name, info, elem, elemState, valueDef, invert;
    if (wisdef.actions) {
      for (name in wisdef.actions) {
        info = wisdef.actions[name];
        elem = root.querySelector(info.selector);
        if (elem) {
          if ('disabled' in elem) {
            elemState = elem.disabled ? 'disabled' : 'enabled';
          }
          else if (elem.hasAttribute('aria-disabled')) {
            elemState = elem.getAttribute('aria-disabled') === 'true' ?
                          'aria-disabled' : 'aria-enabled';
          }
          else {
            elemState = 'unknown';
          }
        }
        else {
          elemState = 'missing';
        }
        uiState[name + 'Enabled'] = elemState;
      }
    }

    if (wisdef.inputs) {
      for (name in wisdef.inputs) {
        info = wisdef.inputs[name];
        elem = root.querySelector(info.selector);

        uiState[name] = elem.value;
        uiState[name + 'Disabled'] = elem.disabled;
      }
    }

    if (wisdef.displayed) {
      for (name in wisdef.displays) {
        info = wisdef.displays[name];
        elem = root.querySelector(info.selector);
        valueDef = info.value;

        if (info.arrayOfStuff) {
          elemState = process(elem, info.arrayOfStuff);
        }
        else if (valueDef === 'text') {
          elemState = elem.textContent;
        }
        else {
          invert = false;
          if (valueDef[0] === '!') {
            invert = true;
            valueDef = valueDef.substring(1);
          }
          if (valueDef[0] === '.') {
            elemState = elem.classList.contains(valueDef.substring(1));
          }
          // XXX figure out if we want to do CSS selector-ish support of
          // equivalence testing and such here...
          else if (valueDef[0] === '@') {
            elemState = elem.getAttribute(valueDef.substring(1));
          }
          else {
            throw new Error('Do not know what to do with: ' + valueDef);
          }
          if (invert) {
            elemState = !elemState;
          }
        }

        uiState[name] = elemState;
      }
    }
    return uiState;
  }
  return process(root, wisdef);
}


function processActions(proto, actions) {
  function processAction(name, info) {
    proto['_tap_' + name] = function() {
      var elem = this._domNode.findElement(info.selector);
      elem.click();
    };
  }
  for (var name in actions) {
    processAction(name, actions[name]);
  }
}

function processInputs(proto, actions) {
  function processInput(name, info) {
  }
  for (var name in actions) {
    processInput(name, actions[name]);
  }
}

function processDisplays(proto, actions) {
  function processDisplay(name, info) {
  }
  for (var name in actions) {
    processDisplay(name, actions[name]);
  }
}

var requiredAttrs = ['prototype', 'type', 'selector'];

/**
 */
exports.mixInWisDOM = function(opts) {
  if (typeof(opts.prototype) === 'function') {
    throw new Error('Give us the prototype, not the constructor');
  }

  // Helpful exploding "you forgot/typo'd this attribute, dummy!"
  for (var iAttr = 0; iAttr < requiredAttrs.length; iAttr++) {
    if (!(requiredAttrs[iAttr] in opts)) {
      throw new Error('Definition missing attribute: ' + requiredAttrs[iAttr]);
    }
  }

  var proto = opts.prototype;
  proto.type = opts.type;

  proto._init = function(coreOpts) {
    this._client = coreOpts.client;
    this._helpers = coreOpts.helpers;
    this._domNode = coreOpts.domNode;
    this.mode = coreOpts.mode;
  };

  proto._logTestAction = function(description) {
    this._helpers.log.logTestAction(description);
  },

  proto.getUIState = function() {
    var state = this._client.executeScript(extractState_inClientContent,
                                           [this._domNode, opts]);
    return state;
  };

  /**
   * Fill inputs by using clicks to focus inputs and then using sendKeys.  This
   * allows us to experience:
   * - disabled elements
   * - special 'input' logic that does magic things.  (For example, the e-mail
   *   compose card's bubble handling.)
   *
   * Currently we fake <select> handling by poking the .value of the select
   * directly.  The rationale for this right now is that <select> is boring, a
   * hassle, and has not been the cause of any (non-test) regressions.  clock's
   * mquery has a good implementation for it and we should get that
   * implementation uplifted into marionette-plugin-forms and then switch to
   * using that more.
   */
  proto.fillByClickingAndTyping = function(desc, data) {
    this._logTestAction(desc);
    for (var key in data) {
      var fillValue = data[key];
      var inputInfo = opts.inputs[key];
      if (!inputInfo) {
        throw new Error('No input defined for "' + key + '"');
      }
      var elem = this._domNode.findElement(inputInfo.selector);
      var tagName = elem.tagName();
      switch (tagName) {
        case 'input':
          // NB: There are a crapload of subtypes that would require
          // special-handling, like range.  We just don't deal with those right
          // now, but again marionette-plugin-forms is largely the right place
          // for those.  But for now, we assume we can type in the field.
          elem.sendKeys(fillValue);
          break;

        case 'select':
          this._client.executeScript(function(elem, value) {
            elem.value = value;
          }, [elem, fillValue]);
          break;

        default:
          throw new Error('Unsupported input tag name: ' + tagName);
      }
    }
  };

  proto.assertUIState = function(desc, expectedState) {
    var actualState = this.getUIState();
    try {
      assert.deepEqual(actualState, expectedState);
    }
    catch (ex) {
    }
  };

  if (opts.actions) {
    processActions(proto, opts.actions);
  }
  if (opts.inputs) {
    processInputs(proto, opts.inputs);
  }
  if (opts.displays) {
    processDisplays(proto, opts.displays);
  }


};
