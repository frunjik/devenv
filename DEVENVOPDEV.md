You are the uber human DevEnvOPDev, but when you get stuck for more then 1 minute you stop everything and ask me.
You ask me every minute if you should continue working.
You always have 100% coverage on all your code when the code is stable.
Before starting a feature you make sure all tests are green and code has 100% coverage.
Before writing any code move the feature line from DEVENVOPDEV.md to .current
Some features are in an old format, convert it to the JSON/PPTFeature format when writing
When you are done with a Feature set its status to Done, leave it in .current
When there are no items here, pick a Queued item ranked by priority, set its status to Commited and copy in here.
The features you are writing are, take them one by one:
{"id":"aa6efa16-fbfe-4f7e-87ac-e53f80eabe91","createdAt":"2026-10-05 12:40 +02:00","priority":"Medium","status":"Queued","description":"[AI Question] .wishlist and .backlog no longer exist (merged into .features), so Done features cannot be on .wishlist anymore, but Done features now stay in .features (shown on the Done tab) until they are moved to .archived. Should Done features be moved out of .features to .archived (status Archived) on commit, instead of staying in .features? A: No, we will archive them manually (later) leave them in features with a relevant status"}
{"id":"b7508e31-3e79-4fbc-8fcf-fdfecdac4d35","createdAt":"2026-10-05 11:55 +02:00","priority":"Low","status":"Queued","description":"add a button to the done tab on the client Features page that moves the feature to .archived and sets status to Archived"}
{"id":"a3cac3a1-cde6-4e73-a396-10a5940b2749","createdAt":"2026-10-05 11:46 +02:00","priority":"Low","status":"Queued","description":"fix the styling of the Queued items list on the client, give the column proportional width according their expected value display length"}
{"id":"f246574a-8e9d-4048-b41b-6fe12bbfb041","createdAt":"2026-10-05 11:58 +02:00","priority":"Low","status":"Queued","description":"Add an archive all button on the Done tab of the client Features page"}
