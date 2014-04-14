Code that manipulates the operation of the email app goes in here so that all
of our evil is consolidated, it's easier to diagnose what's likely to break
when we're changing the back-end, and it's easier to consider what should be
done a different way / be explicitly supported by the front-end or back-end.

Note that we're not counting white-box reads of program state as
monkeypatching.  We do that all over the place.
