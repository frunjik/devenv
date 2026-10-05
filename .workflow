./.backlog   list of open features

./.queued    list of queued features
./.current   active features

./.delivered list of processed features
./.history   list of closed features
./.archived  list of archived features

./.features  id status priority domain category questions

./.feature   id status questions

./.success
./.failure

./.questions 
./.glossary

feature status: new, backlog, commited, progress, delivered, questions, review, verify, done, archived

rules
when you have a question make a feature for it on .backlog setting the question field and setting its status to Questions, continue working on the next open feature.
When you start working on an feature move it from the .queued list (DEVENVOPDEV.md) to .current.
When the feature is commited move it from .current to .delivered

