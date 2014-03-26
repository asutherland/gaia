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

/**
 * This function is run in the client context to extract state from the DOM
 * given a `WisDOMDef`.  While the same thing could be done by using the
 * Marionette bindings, this has the serious advantage that we coherently
 * checkpoint state.  A lesser but still significant advantage is that it's
 * likely much faster given that we avoid a serious number of network roundtrips
 * and context switches.
 */
function extractStateRemotedToClient(wisdef) {
}

function retrieveState

/**
 */
exports.mixInWisDOM = function(opts) {
  var proto = opts.prototype;

  proto.assert
};
