/*jshint node: true */
/*global marionette, setup, test */
'use strict';

/**
 * Test all aspects of periodic sync/cronsync and the resulting notifications.
 *
 * ## User Stories ##
 *
 * These are our user stories/features and the summary of what we need to check.
 * Keep in mind that especially for notifications have gone though an exciting
 * series of limitations, so we may deviate quite highly from the original user
 * stories on the bug.
 *
 * - Productivity2: Email Invocation from Notification
 *   https://bugzil.la/892523
 *   - 2A: For a single-message notification open directly to the message
 *     reader for the given message
 *   - 2B: For a grouped notification open to the message_list for the inbox for
 *     that account.  (Notifications are only generated for new messages in the
 *     inbox.)
 *
 * - Productivity3: Ability to Change Sync Interval
 *   https://bugzil.la/892518
 *   - 3A: Default sync interval is never
 *   - 3B: Can pick sync interval at account creation time
 *   - 3C: Can change sync interval via settings
 *   - (Checked elsewhere: we open ourselves up if not active)
 *
 * - Productivity4: Email Notifications - Email App Not Foreground
 *   https://bugzil.la/892519
 *   - 4A: If there are no notifications for an email account and the email app
 *         is not in the foreground, generate a new notification when new
 *         messages are received.
 *   - 4B: If there are existing notifications for for an email account, update
 *         the existing notification when new messages are received.
 *
 * - Productivity55: Email Notifications - Email App Foreground
 *   https://bugzil.la/892521
 *
 * ## Implementation Ramifications ##
 *
 * - If the email app has to wake itself up and the user does not switch to
 *   the app before it completes the sync process, it shuts down via
 *   window.close() when done.  A related optimization is that the UI is not
 *   spun up by the cronsync process and we wait for the user to switch to the
 *   app.
 *   - X1A: Ensure that cronsync does not close the email app if the app was
 *     started by the user.
 *   - X1B: Verify that the UI does not start up if it thinks it is woken up by
 *     an alarm.
 *   - X1C: Verify that if we tell the email app the user switched to it while
 *     it is performing cronsync that the UI starts up and that the email app
 *     does not close itself when done.
 *
 * ## Permutations ##
 *
 * Our permutation matrix is as follows, some permutations are not possible:
 * - Foreground versus background
 * - Online versus offline
 * - UI ever shown / never displayed
 **/

marionette('email', function() {
  var app;

  var client = marionette.client({
    settings: {
      // disable keyboard ftu because it blocks our display
      'keyboard.ftu.enabled': false
    }
  });

  var server = serverHelper.use(null, this);

  test('cronsync', function() {
  });
});
