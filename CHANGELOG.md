# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog] and this project adheres to [Semantic Versioning].

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html

---
[Unreleased]: https://github.com/metaist/duil.js/compare/0.2.0...HEAD
## [Unreleased]
- #6: add License file

---
[0.2.0]: https://github.com/metaist/duil.js/compare/0.1.3...0.2.0
## [0.2.0] - 2018-05-11
### Compatability Warnings
- `duil.List.update()` now accepts arguments in a different in order: `(view, data, index)` instead of `(data, index, view)`.

### Added
- #3: add unit tests using `tape`
- #5: updated tooling for development (`yarn`, `rollup`, `buble`)
- add `duil.Group` for non-DOM-based views

### Changed
- `duil.List` now uses `duil.dom` to handle DOM `Element` and `jQuery` transparently.
- duil can now be run with zero dependencies. The relevant lodash functions are baked in and jQuery is completely optional.

### Removed
- `duil.List.items()` this is no longer needed because the template is removed from the DOM manually and views are refreshed immediately at the start of `.render()`.

### Fixed
- #4: fix lodash rename of `_.contains` to `_.includes`

---
[0.1.3]: https://github.com/metaist/duil.js/compare/0.1.2...0.1.3
## [0.1.3] - 2016-05-27
### Added
- #2: add support for new attribute types: data, addClass, toggleClass, removeClass

---
[0.1.2]: https://github.com/metaist/duil.js/compare/0.1.1...0.1.2
## [0.1.2] - 2015-09-20
### Fixed
- #1: fix lack of thisArg in lodash 4.0.0

---
[0.1.1]: https://github.com/metaist/duil.js/compare/0.1.0...0.1.1
## [0.1.1] - 2015-09-20
Unknown changes.

---
[0.1.0]: https://github.com/metaist/duil.js/tree/0.1.0
## [0.1.0] - 2015-09-09
Initial release.
