# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog] and this project adheres to [Semantic Versioning].

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html

---
[Unreleased]: https://github.com/metaist/duil.js/compare/0.3.0...HEAD
## [Unreleased]
**Compatability Warnings**
_None_

**Added**
- add `duil.$set()` for the jQuery `.set()`
- add `duil._build` for internal build date/time for debugging
- #18: performance test
- #19: `Widget.invoke()` for calling prototype functions in the context of a given widget

---
[0.30]: https://github.com/metaist/duil.js/compare/0.2.0...0.3.0
## [0.3.0] - 2018-05-11
**Compatability Warnings**
- `duil.Widget` and its subclasses are now proper ES6 classes so `Widget.subclass` and `Widget.superclass` have been removed. The `new` keyword is now **required** when creating `duil.Widget` and any of its subclasses.

**Added**
- #6: add License file
- add ESLint

**Changed**
- #17: change `duil.VERSION` to `duil.version`

**Removed**
- #15: remove `Widget.subclass` and `Widget.superclass`
- remove transpiling using `buble`

**Fixed**
- #16: fix: global is not defined error for detecting jQuery

---
[0.2.0]: https://github.com/metaist/duil.js/compare/0.1.3...0.2.0
## [0.2.0] - 2018-05-11
**Compatability Warnings**
- `duil.List.add()` renamed to `duil.List.create()`
- `duil.List.update()` now accepts arguments in a different in order: `(view, data, index)` instead of `(data, index, view)`.
- both `duil.List.create()` and `duil.List.update()` return the `view` instead of the widget (`this`).

**Added**
- #3: add unit tests using `tape`
- #5: updated tooling for development (`yarn`, `rollup`, `buble`)
- add `duil.Group` for non-DOM-based views

**Changed**
- `duil.List` now uses `duil.dom` to handle DOM `Element` and `jQuery` transparently.
- duil can now be run with zero dependencies. The relevant lodash functions are baked in and jQuery is completely optional.
- change `duil.List.add()` to `duil.List.create()`; it also returns the view instead of `this`.

**Removed**
- `duil.List.items()` this is no longer needed because the template is removed from the DOM manually and views are refreshed immediately at the start of `.render()`.

**Fixed**
- #4: fix lodash rename of `_.contains` to `_.includes`

---
[0.1.3]: https://github.com/metaist/duil.js/compare/0.1.2...0.1.3
## [0.1.3] - 2016-05-27
**Added**
- #2: add support for new attribute types: data, addClass, toggleClass, removeClass

---
[0.1.2]: https://github.com/metaist/duil.js/compare/0.1.1...0.1.2
## [0.1.2] - 2015-09-20
**Fixed**
- #1: fix lack of thisArg in lodash 4.0.0

---
[0.1.1]: https://github.com/metaist/duil.js/compare/0.1.0...0.1.1
## [0.1.1] - 2015-09-20
Unknown changes.

---
[0.1.0]: https://github.com/metaist/duil.js/tree/0.1.0
## [0.1.0] - 2015-09-09
Initial release.
