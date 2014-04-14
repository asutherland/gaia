## Testing Overview ##

This file enumerates the desired / expected test cases and how they are tested
or how they should be tested.  Think of it as a table of contents for the tests.
For specific details on what each test covers, you will want to read the actual
test file or test case.

Our test mechanisms in general order of preference:

1. gaia-email-libs-and-more back-end tests.  These live in
   https://github.com/mozilla-b2g/gaia-email-libs-and-more and include tests
   that run against fake IMAP, fake POP3, and fake ActiveSync servers.  These
   used to run against real IMAP servers too, but that is currently not
   happening.  https://bugzil.la/897323 tracks making real server tests happen
   again.

   This is the best place to add and run tests because these the back-end
   library is intended to be reusable and the tests are able to more directly
   interact with the back-end which lets us more efficiently test diverse edge
   cases.  These tests are not a replacement for front-end tests that ensure that
   the UI is using the back-end correctly.
   
   These tests are run automatically by Travis for the GELAM repo.
   
2. Gaia unit tests.  These live in GAIA/apps/email/test/unit.  These are unit
   tests for more complicated pieces of the front-end that cannot be moved into
   the back-end or just have not been moved into the back-end yet.  These test
   edge-cases and permutations in isolation and should be simpler and run faster
   than our marionette tests.
   
   More information on Gaia unit tests can be found at:
   https://developer.mozilla.org/en-US/Firefox_OS/Platform/Automated_testing/Gaia_unit_tests
   
   These tests are run automatically by Travis for the Gaia repo.
   
3. Gaia JS marionette (integration) tests.  These live in GAIA/apps/email

   These tests are run automatically by Travis for the Gaia repo and on TBPL.

4. Gaia Python marionette tests.  These pre-date the JS Marionette tests.  In
   general we want these to be replaced by JS Marionette tests.  A particular
   advantage of these tests is that they are able to use and keep credentia

   See these links possibly:
   https://developer.mozilla.org/en-US/Firefox_OS/Platform/Automated_testing/gaia-ui-tests
   https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/Python_Marionette

   Some of these tests are run automatically by Travis for the Gaia repo and some
   are run for TBPL.  I think the one with credentials are TBPL only.  I find it
   confusing.  Please feel free to update this blurb with better info.
   
5. Manual test cases tracked in moztrap.  In general we want these all to be
   replaced by Gaia JS Marionette tests, although it could make sense to leave
   a small sampling for broad smoke-test purposes.

   This link should bring up a list of all of the e-mail test cases:
   https://moztrap.mozilla.org/manage/cases/?filter-tag=262

   Docs on how to use moztrap can be found at:
   https://moztrap.readthedocs.org/en/latest/userguide/index.html


## The Tests ##

TO REAL marionette tests:
  account_settings_test.js
  activity_test.js
  compose_test.js
  cronsync_test.js
  message_reading.js
  

TO MOOT marionette tests:
  local_drafts_test.js
  message_list_test.js
  next_previous_test.js
  notification_click_test.js
  notification_disable_test.js
  notification_foreground_test.js
  notification_set_interval_test.js
  reply_imap_email_test.js
  search_test.js

MOOT marionette tests:
  

* Managing Accounts
  * Creating Accounts
      * General
        * backend: test_account_defaults.js
        * backend: test_account_logic.js
        * backend: test_autoconfig.js
        * backend: test_incoming_prober.js
        * backend: test_just_auth.js
        * backend: test_smtp_prober.js
      * Special Error Conditions
        * backend: test_account_create_unit.js
  * Steady-State Error Conditions
    * backend: test_account_bad_password_error.js
       
* Mail Sending
  * Attachments
    * backend: test_compose.js
    * backend: test_compose_detach.js
    * backend: test_compose_blobs.js
    * marionette: compose_test.js
  * Drafts
    * backend: test_compose.js
    * marionette: compose_test.js
  * Error Conditions
    * marionette: compose_test.js
  * Forwards
    * backend: test_compose.js
    * marionette: compose_test.js
  * Reply variants
    * backend: test_compose.js
    * marionette: compose_test.js
  * Sending
    * backend: test_compose.js
    * marionette: compose_test.js

* Mail Receipt
  * ActiveSync
    * Misc
      * backend: test_activesync_html.js
      * backend: test_activesync_recreate.js
      * backend: test_nonimap_sync_general.js
      * backend: test_sync_server_change.js
    * Real Server Testing
  * Attachment Handling
    * backend: test_body_modified_attachments.js
  * Bodies
    * HTML
      * backend: test_mail_html.js
      * backend: test_mime.js
    * Internals
      * backend: test_body_observers.js
      * backend: test_downloadbodyreps_idempotency.js
    * Plaintext
      * backend: test_mail_quoting.js
  * Folders
    * backend: test_account_folder_logic.js
  * IMAP
    * Bad Servers
      * backend: test_imap_bad_servers.js
      * backend: test_imap_proto.js
    * Error Conditions
      * backend: test_imap_errors.js
    * Real Server Testing
    * Sync
      * backend: test_imap_general.js
      * backend: test_imap_internals.js
      * backend: test_imap_complex.js
      * backend: test_imap_lazybodies.js
      * backend: test_imap_literals.js
      * backend: test_imap_parallelfetch.js
      * backend: test_imap_partialbodyfetching.js
      * backend: test_imap_proto.js
      * backend: test_sync_server_change.js
  * On-Demand Fetching of Snippets
    * backend: test_imap_parallelfetch.js
    * backend: test_imap_partialbodyfetching.js
  * Periodic Synchronization
  * POP3
    * Misc
      * backend: test_nonimap_sync_general.js
      * backend: test_pop3_checkpoint_sync.js
      * backend: test_pop3_connection_use.js
    * Real Server Testing
    * Too Many Messages
      * backend: test_pop3_overflow_sync.js

* Mail Reading / Browsing
  * Contacts
    * backend: test_mailapi_contacts.js
  * Links / e-mail addresses
    * backend: test_linkify.js
  * Searching
    * backend: test_search.js
    * backend: test_search_slice.js

* Managing Mail
  * Deleting Messages
    * backend: test_mutation.js
  * Disk Usage
  * Flagging Messages
    * backend: test_mutation.js
  * Moving Messages
    * backend: test_mutation.js


* Internationalization
  * backend: test_intl_unit.js
  * backend: test_mail_mime.js

* Internals
  * backend: test_folder_storage.js
  * backend: test_net_main_blob_streaming.js
  * backend: test_splice_ordering.js

* Utility Code
  * backend: test_allback_latch.js
  * backend: test_b64_unit.js
  * backend: test_html_escaping_unit.js

* Special Human Verification Helpers
  * backend: test_just_auth.js
  * backend: test_torture_composite.js
