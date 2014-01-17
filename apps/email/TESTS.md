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

   These tests are run automatically by Travis for the Gaia repo.

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

* Managing Accounts
    * Creating Accounts
        * Error Conditions
* Mail Sending
    * Attachments
    * Drafts
    * Error Conditions
    * Forwards
    * Replies
    * Sending
* Mail Receipt
    * ActiveSync
        * Real Server Testing
    * Attachment Handling
    * Error Conditions
    * IMAP
        * Real Server Testing
    * On-Demand Fetching of Snippets
    * Periodic Synchronization
    * POP3
        * Real Server Testing
* Managing Mail
    * Deleting Messages
    * Disk Usage
    * Flagging Messages
