# Using and Writing Tests #

The is the 'how'.  The 'why' and 'WTF?' excuses are down below.



### Use by Entry Points ###

There are a variety of initial states for the e-mail app (triggered when it was
closed.)

- Opened from the home-screen by the user:
  - No existing accounts, autoconfig screen displayed.
  - Existing accounts, inbox of the default account is displayed.
- Triggered by an activity to open the compose UI:
  - No existing accounts, a prompt is displayed asking if we should create one.
  - Existing accounts, the default account's inbox is opened and a compose UI
    is shown on top of that.
- Triggered by a notification reported by the e-mail app:
  - The notification was for multiple messages (message_list) type, so we
    display the message list for the account the notification was for.
  - The notification was for a single message so we display the message reader.
- Woken up by a mozAlarm for periodic sync purposes.  No UI is displayed.

It is also possible for notifications and activities to trigger 

# Implementation Details #

## WisDOM: DOM Helpers ##

Rather than just having a bunch of selector strings that we put a comment above
and then manually manipulate and investigate the state of, we declaratively
define:

- The DOM nodes on a page that are used for interaction.  Buttons.
- The DOM nodes on a page that display feedback to the user and how to extract
  the value from that DOM state.

This nets us the following perks:

- We automate the process of asserting the state of the DOM based on an object
  dictionary we pass in.
  
- We automatically generate convenience helpers for the DOM nodes.

- We are able to somewhat concisely display the state of the DOM from an app
  domain perspective without forcing developers to trawl through the entire DOM
  or look at screenshots (which can be impacted by scrolling/screen real-estate
  issues).
  
- Future use: we know which nodes in the DOM are interesting and are able to
  explain what their purpose is.

# Meta #

## Overview ##

### Goals ###

- Run fast.  Before the last mass disabling of the e-mail tests in February
  2014 we were taking approximately 7 minutes to run the limited number of
  e-mail integration tests.

- Don't be flakey.  Which means making it hard to write flakey tests.

- Have understandable errors provided in context.

### Strategy ###

- Assume a rational, if unexpected, explanation for failures.  This means we
  don't sprinkle around calls to wait for DOM nodes to appear in case they
  somehow disappeared.  Before we take any action, we should have well-defined
  belief of the system state.  We only wait for things to appear/change if
  those are things that are changing.

- Ruthless control of timeouts/delays.  We have a toaster that disappears after
  a 5 second timeout and a blue notification bar that also disappears after 5
  seconds.  When do these disappear in our tests?  Only when our test says so.
  In short, if there is a setTimeout() that is not a zero timeout, then we are
  in charge of it.  For transitions/animations, we either wait for it to
  complete or it has to not matter (ex: infinite spinner / marquee).

- Clear delineation of dangerous and therefore framework-internal methods.
  Every button has a side-effect; that's why they're there.  So in the test,
  you don't randomly tap on buttons.  You call the higher-level function that
  takes care of making sure everything happened right.  If there's something
  important for your test to check in the process of that higher-level action,
  you put that checking logic in the helper and pass the explicit state to
  check for as part of a dictionary.

  For example, when you reply to a message, we pop up a menu of potential ways
  to reply to the message.  Reply-to-author, reply-to-all, reply-to-list (some
  day), and forward.  If you want to check if an option is available, you pass
  that in.  You never ever tap on the reply button yourself in the test.

- Disable the software keyboard.  There is a class of potential bugs related to
  the software keyboard and the resize events it triggers, but we can emulate
  these manually and intentionally in the cases where we care as humans
  discover them.
