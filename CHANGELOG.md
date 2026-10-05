# [Changelog](https://github.com/frunjik/devenv/CHANGELOG.md)
All notable changes to this project will be documented in this file.

The format is (loosely) based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to Semantic Versioning.

# 0.0.3 Unreleased

### Added
- Features are stored as `PPTFeature` JSON lines with a unique ID in `.features` (open, queued and done), `.current` and `.archived`.
- `Queued` and `Committed` feature statuses; starting a feature sets it to `Queued` and adds a task to `DEVENVOPDEV.md`.
- New features default to the `Wished` status.
- Feature states page, and editing of Queued features on the client.
- Archived tab on the Features page, an Archive button per Done feature and an Archive all button (`POST /features/:id/archive`, `POST /features/archive-done`).
- The selected Features tab is kept in the URL (`?tab=`).
- On commit, Done features in `.current` move into `.features`.

### Changed
- All shared types now live in `@ppt`; `@shared` imports them from there.
- The features API and client use `PPTFeature` instead of the text representation.
- The client feature list shows the Open tab first, followed by Queued, Done and Archived; Queued and Committed features are never listed as Open.
- `.wishlist`, `.backlog` and `.delivered` are merged into `.features` on first read; `.archived` is converted to JSON on first read.
- Build order is now `ppt`, `shared`, `client`.

### Removed
- `@shared/ppt-fields`; `GET /ppt/fields` returns an empty list.

# 0.0.2 2023-03-05 Cleanup

### Added
- v0.0.2 - setup angular workspace (WIP)
- v0.0.2 - root .gitnore file

### Changed
- v0.0.2 - Update Server initial root path
- v0.0.2 - Update Server Npm Packages
- v0.0.2 - Update Client Npm Packages
- v0.0.2 - Moved CHANGELOG from client to root

### Removed

# 0.0.1 2023-03-05 Initial Version

### Added

#### Changelog - Guiding Principles
- Changelogs are for humans, not machines
- There should be an entry for every single version
- The same types of changes should be grouped
- Versions and sections should be linkable
- The latest version comes first
- The release date of each version is displayed
- Mention whether you follow Semantic Versioning


#### Changelog - Types of Changes
- Added - for new features
- Changed - for changes in existing functionality
- Deprecated - for soon-to-be removed features
- Removed - for now removed features
- Fixed - for any bug fixes
- Security - in case of vulnerabilities

### Changed


### Removed
