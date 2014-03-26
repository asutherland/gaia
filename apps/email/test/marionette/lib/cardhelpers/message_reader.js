var baseCardMagic = require('./base_card_magic');

function MessageReaderHelper() {
}
MessageReaderHelper.prototype = {

  advanceUp: function(desc, opts) {
  },

  advanceDown: function(desc, opts) {
  },

  /**
   * @param {"direct"|"all"|"forward"} opts.mode
   */
  replyToMessage: function(desc, opts) {
  }
};

var peepDisplayTemplate = {
  selector: '.msg-peep-bubble',
  displays: {
    displayed: {
      desc: 'what we are displaying in the bubble; either name or address',
      selector: '.msg-peep-content',
      value: 'text'
    },
    addressIsDisplayed: {
      desc: 'are we indicating this is an address?',
      selector: '.msg-peep-content',
      value: '.msg-peep-address' // true if the class is present
    }
  }
};

baseCardMagic.mixInWisDOM({
  prototype: MessageReaderHelper.prototype,
  actions: {
    back: {
      desc: 'back arrow to close the message reader',
      selector: '.msg-back-btn',
    },
    msgUp: {
      desc: 'up arrow to advance to a newer message from within the reader',
      selector: '.msg-up-btn'
    },
    msgDown: {
      desc: 'down arrow to advance to an older message from within the reader',
      selector: '.msg-down-btn'
    },

    delete: {
      desc: 'delete button to move to trash or purge if already there',
      selector: '.msg-delete-btn'
    },
    star: {
      desc: 'star/flag button to toggle starred/flagged status',
      selector: '.msg-star-btn'
    },
    move: {
      desc: 'move the message to another folder button',
      selector: '.msg-move-btn'
    },
    reply: {
      desc: 'bring up the reply variants action menu including forwarding btn',
      selector: '.msg-reply-btn'
    },

    loadStuff: {
      desc: 'prompt to display external images or download embedded images',
      selector: '.msg-reader-load-infobar'
    },
  },
  displays: {
    authorDisplayName: {
      desc: 'we display the author display name in the card header',
      selector: '.msg-reader-header-label',
      value: 'text'
    },
    authorMailAddress: {
      desc: 'peep bubble display the mail address of the author',
      selector: '.msg-enevelope-from-line .msg-peep-content',
      value: 'text'
    },
    to: {
      desc: 'the to recipients',
      selector: '.msg-envelope-to-line',
      arrayOfStuff: peepDisplayTemplate
    },
    subject: {
      desc: 'message subject',
      selector: 'msg-envelope-subject-container',
      value: 'text'
    },
  },
  popups: {
    replyMenu: {
      actions: {
        reply: {
          desc: 'implied direct reply/reply to author',
          selector: '.msg-reply-menu-reply',
        },
        replyAll: {
          desc: 'reply-to-all, conditionally collapsed based on domain logic',
          selector: '.msg-reply-menu-reply-all'
        },
        forward: {
          desc: 'forward the message',
          selector: '.msg-reply-menu-forward'
        },
        cancel: {
          desc: 'cancel out of the reply menu',
          selector: '.msg-reply-menu-cancel'
        }
      }
    }
  }
});
