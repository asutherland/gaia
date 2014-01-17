/**
 * Convenience wrapper for dealing with a list of messages in the message_list
 * given the Marionette elements wrapping them.  Various set operations are
 * supported.
 *
 * Note that there are some things we could do more efficiently; right now we
 * are erring on the side of using straightforward Marionette operations that
 * express what we are doing.  In general when dealing with more than one
 * message at a time it's potentially much more efficient to send JS over the
 * wire.  (Or we could use the async API to pipeline things more?)
 */
function MailDOMMessageList(client, marionetteElems) {
  this.client = client;
  this.elements = marionetteElems;
}
module.exports = MailDOMMessageList;
MailDOMMessageList.prototype = {
  _fetchChildTextContent: function(childSelector) {
    var texts = [];
    for (var i = 0; i < this.elements.length; i++) {
      var elem = this.elements[i];
      return elem.findElement(childSelector).text();
    }
    return texts;
  },

  _boolcheckChildClassPresence: function(childSelector, checkClass,
                                         returnIfPresent) {
    var bools = [];
    for (var i = 0; i < this.elements.length; i++) {
      var elem = this.elements[i];
      var classAttr =
            elem.findElement(childSelector).getAttribute('class') || '';
      var classes = classAttr.split(/ +/g);
      var present = classes.indexOf(checkClass) !== -1;
      if (present)
        bools.push(returnIfPresent);
      else
        bools.push(!returnIfPresent);
    }
    return bools;
  },

  /**
   * Return a list of the message subjects as present in the DOM.  Note that
   * the subject of the message may be much longer than what is actually
   * displayed on the screen due to overflow.
   */
  getMessageSubjects: function() {
    return this._fetchChildTextContent('.msg-header-subject');
  },

  /**
   * Return a list of the message snippets as present in the DOM.  Note that
   * the snippet of the message may be longer than what is actually displayed
   * on the screen due to overflow.
   */
  getMessageSnippets: function() {
    return this._fetchChildTextContent('.msg-header-snippet');
  },

  /**
   * Return a list of the
   */
  getMessageAuthors: function() {
    return this._fetchChildTextContent('.msg-header-author');
  },

  /**
   * Return a list of booleans indicating whether each message in the list is
   * read *as indicated by the UI styling*.  So unread is false, read is true.
   */
  getReadStates: function() {
    // Mimic isRead: Return false when the unread class is present
    return this._boolcheckChildClassPresence(
      '.msg-header-unread-section', 'msg-header-unread-section-unread',
      false);
  },

  /**
   * Return a list of booleans indicating whether each message in the list is
   * starred/flagged *as indicated by the UI styling*.  So starred/flagged is
   * true, unstarred/unflagged is false.
   */
  getStarredStates: function() {
    // Mimic isStarred: Return true when the starred class is present
    return this._boolcheckChildClassPresence(
      '.msg-header-star', 'msg-header-star-starred', true);
  },

  /**
   * Wait for the messages to disappear from the list.
   */
  waitForMessagesToDisappear: function() {
    this.elements.forEach(function(msgElem) {
      this.client.helper.waitForElementToDisappear(msgElem);
    }.bind(this));
  },

  waitForMessagesToBecomeStarred: function() {
  },

  waitForMessagesToBecomeUnstarred: function() {
  },

  waitForMessagesToBecomeRead: function() {
  },

  waitForMessagesToBecomeUnread: function() {
  },

  /**
   * Tap all the messages in the list.
   */
  tapAll: function() {
    for (var i = 0; i < this.elements.length; i++) {
      this.elements[i].tap();
    }
  },

  /**
   * Return a new MailDOMMessageList containing the messages matching the
   * given spec.  We will throw if we don't find enough messages; this avoids
   * tests accidentally passing in the case of comprehensive breakage.
   *
   * @param matchSpec
   * @param matchSpec.subjects {String[]}
   *   One message is let through for each exact match of the subjects in this
   *   list.  So if you have N messages with the exact same subject, you need
   *   to use them N times or use a different specifier.
   */
  match: function(matchSpec) {
    var keeping = this.elements.concat();
    for (var matchName in matchSpec) {
      // matchs are allowed to mutate the list directly if they want, but they
      // still need to return it.
      keeping = this['_match_' + matchName](keeping, matchSpec[matchName]);
    }
    return new MailDOMMessageList(this.client, keeping);
  },

  _match_subjects: function(elems, keepSubjects) {
    var elemSubjects = this.getMessageSubjects();
    // We remove subjects from the list as they match.
    var unmatchedSubjects = keepSubjects.concat();
    var keep = [];
    for (var i = 0; i < elems.length; i++) {
      var subject = elemSubjects[i];
      var idxSubject = unmatchedSubjects.indexOf(subject);
      if (idxSubject !== -1) {
        unmatchedSubjects.splice(idxSubject, 1);
        keep.push(elems[i]);
      }
    }

    if (unmatchedSubjects.length) {
      throw new Error('Unsatisfied subjects: ' + unmatchedSubjects);
    }

    return keep;
  },
};
