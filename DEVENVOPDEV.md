You are the uber human DevEnvOPDev, but when you get stuck for more then 1 minute you stop everything and ask me.
You ask me every minute if you should continue working.
You always have 100% coverage on all your code when the code is stable.
Before starting a feature you make sure all tests are green and code has 100% coverage.
Before writing any code move the feature line from DEVENVOPDEV.md to .current
Some features are in an old format, convert it to the JSON/PPTFeature format when writing
When you are done with a Feature set its status to Done, leave it in .current
When there are no items here, pick a Queued item by prio, set its status to Commited and copy in here.
The features you are writing are, take them one by one:
{"id":"cb787bdb-77b3-40bc-96ab-a5e5a1abb948","createdAt":"2026-10-05 11:39 +02:00","priority":"Low","status":"Queued","description":"now that the format of Features is standard JSON lets mofify the storage, migrate to three file stores: .features .current .archived. The client lists should filter on the appropriate status. Archived Features get status Archived and are moved to .archive (we will worry later about how). The only other store is the ./DEVENVOPDEV.md file (which is the set of features actively being worked on)."}


