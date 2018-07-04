# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog] and this project adheres to [Semantic Versioning].

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html

---
[Unreleased]: https://github.com/metaist/duil.js/compare/0.3.2...HEAD
## [Unrelease]
_No changes._

---
[#9]: https://github.com/metaist/duil.js/issues/9
[#13]: https://github.com/metaist/duil.js/issues/13
[#18]: https://github.com/metaist/duil.js/issues/18
[#21]: https://github.com/metaist/duil.js/issues/21
[#22]: https://github.com/metaist/duil.js/issues/22
[#23]: https://github.com/metaist/duil.js/issues/23
[0.3.2]: https://github.com/metaist/duil.js/compare/0.3.1...0.3.2
## [0.3.2] - 2018-07-03
**Compatibility Warnings**
- `Widget.render` now has a `changes` parameter which indicates which properties were changed. The impact is mostly felt by `Group.render` which now has different semantics and does not re-render the entire widget, but only those items which changed.
- A related change is that `Group.render` will switch to asnychrnous rendering when the number of changes is very large (default: 1000). The new `Group.drain` method is called repeatedly until all the changes are made.

**Added**
- [#13]: npm package
- [#22]: basic events (`.on`, `.off`, `.trigger`)
- naive diff algorithm to speed up rendering (adds: `duil.diff`, `duil.merge`)
- [#23]: render queue (via `duil.Queue` based on [infloop/queue.js](https://gist.github.com/infloop/8469659)). Big thanks to [@Pugio](https://github.com/Pugio) for suggestions on improving the render queue.
- [#18]: performance tests
- [#9]: react examples
- [#21]: marko examples
- lots of little tests to achieve 100% coverage

**Changed**
- Switched to using [`esm`](https://github.com/standard-things/esm) (thank you [@jdalton](https://github.com/jdalton)!) for build process.

---
[#7]: https://github.com/metaist/duil.js/issues/7
[#11]: https://github.com/metaist/duil.js/issues/11
[#13]: https://github.com/metaist/duil.js/issues/13
[#14]: https://github.com/metaist/duil.js/issues/14
[#12]: https://github.com/metaist/duil.js/issues/12
[#18]: https://github.com/metaist/duil.js/issues/18
[#19]: https://github.com/metaist/duil.js/issues/19
[#20]: https://github.com/metaist/duil.js/issues/20
[0.3.1]: https://github.com/metaist/duil.js/compare/0.3.0...0.3.1
## [0.3.1] - 2018-05-16
**Compatibility Warnings**
- Instead of `duil.Group.KEY_BY_INDEX`, use `duil.Group.prototype.key`.
- `duil.dom` is now a private namespace. Do not rely on it for manipulating the DOM and jQuery.

**Added**
- [#7]: `CONTRIBUTING.md` with instructions on how to make a release
- [#11]: fabric.js example
- marko.js example
- nested widget example
- [#12]: coverage tests
- [#14]: source maps for minified code
- [#18]: performance test
- [#19]: `Widget.invoke()` for calling prototype functions in the context of a given widget. In many respects, this is a less powerful, but cleaner, replacement for `Widget.superclass`.
- `duil._build` for internal build date/time for debugging

**Changed**
- `duil.dom` renamed to `duil._dom` to indicate it is a private namespace
- `duil.List.create()` now inserts the created view into the list of views and `duil.List.render()` no longer re-selects the DOM objects before rendering; this initial select of DOM nodes now happens in `duil.List.init()`

**Removed**
- `duil.Group.KEY_BY_INDEX` because this is simply the default `duil.Group.key` function
- documentation for `duil.dom` because it is a private namespace

**Fixed**
- [#20]: `duil.List` returning DOM objects instead of `jQuery`

---
[#6]: https://github.com/metaist/duil.js/issues/6
[#15]: https://github.com/metaist/duil.js/issues/15
[#16]: https://github.com/metaist/duil.js/issues/16
[#17]: https://github.com/metaist/duil.js/issues/17
[0.3.0]: https://github.com/metaist/duil.js/compare/0.2.0...0.3.0
## [0.3.0] - 2018-05-11
**Compatibility Warnings**
- The `new` keyword is now **required** when creating `duil.Widget` and any of its subclasses because they are proper ES6 classes.
- Instead of `Widget.subclass`, use the `extends` keyword.
- Instead of `Widget.superclass`, use the `super` keyword. In cases where an instance wants to override and call a class method, use `ClassName.prototype.methodName.call(this)`.

**Added**
- [#6]: License file
- linting using `ESLint`

**Changed**
- [#17]: `duil.VERSION` renamed to `duil.version`

**Removed**
- [#15]: `Widget.subclass` and `Widget.superclass`
- transpiling using `buble`; duil is now ES6 code

**Fixed**
- [#16]: global is not defined error for detecting jQuery

---
[#3]: https://github.com/metaist/duil.js/issues/3
[#4]: https://github.com/metaist/duil.js/issues/4
[#5]: https://github.com/metaist/duil.js/issues/5
[0.2.0]: https://github.com/metaist/duil.js/compare/0.1.3...0.2.0
## [0.2.0] - 2018-05-11
**Compatibility Warnings**
- Instead of `duil.List.add()` use `duil.List.create()`.
- Reorder the arguments for `duil.List.update()`: `(view, data, index)` instead of `(data, index, view)`
- Return the `view` from `duil.List.create()` and `duil.List.update()` instead of the widget (`this`).

**Added**
- [#3]: unit tests using `tape`
- [#5]: new dev tools (`yarn`, `rollup`, `buble`)
- `duil.Group` for non-DOM-based views backed by data models

**Changed**
- `duil.List` now uses `duil.dom` to handle DOM `Element` and `jQuery` transparently.
- duil can now be run with zero dependencies. The relevant lodash functions are baked in and jQuery is completely optional.
- `duil.List.add()` renamed to `duil.List.create()`
- `duil.List.update()` to take `(view, data, index)` instead of `(data, index, view)`
- `duil.List.create()` and `duil.List.update()` to return `view` instead of `this`

**Removed**
- `duil.List.items()` because the template is removed from the DOM manually and views are refreshed immediately at the start of `.render()`.

**Fixed**
- [#4]: lodash rename of `_.contains` to `_.includes`

---
[#2]: https://github.com/metaist/duil.js/issues/2
[0.1.3]: https://github.com/metaist/duil.js/compare/0.1.2...0.1.3
## [0.1.3] - 2016-05-27
**Added**
- [#2]: `$.fn.set` now supports `data`, `addClass`, `toggleClass`, and `removeClass`

---
[#1]: https://github.com/metaist/duil.js/issues/1
[0.1.2]: https://github.com/metaist/duil.js/compare/0.1.1...0.1.2
## [0.1.2] - 2016-05-25
**Fixed**
- [#1]: lack of `thisArg` in lodash 4.0.0

---
[0.1.1]: https://github.com/metaist/duil.js/compare/0.1.0...0.1.1
## [0.1.1] - 2015-09-20
**Fixed**
- build to include `jquery.duil.js` correctly

---
[0.1.0]: https://github.com/metaist/duil.js/tree/0.1.0
## [0.1.0] - 2015-09-09
- Initial release.

**Added**
- `README`
- `duil.Widget`, `duil.List`
- `duil.Widget.superclass`, `duil.Widget.subclass`
- jQuery function `.set()` for setting multiple attributes simultaneously
- Gulp build
- source maps
