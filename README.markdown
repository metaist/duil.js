# duil = data + ui + loop
[Latest Release] - [Documentation] - [Issues]

**duil** (`/ˈduəl/`, like duel) is a simple JavaScript library for creating single page apps that react to changes in their underlying data. duil leverages the technologies you already know, like JavaScript and HTML, instead of making you learn a brand new syntax. With duil, you can create dynamic web pages with less code and cleaner abstractions.

[![version][badge-version]](https://github.com/metaist/duil.js/blob/master/CHANGELOG.md)
[![license][badge-license]](https://github.com/metaist/duil.js/blob/master/LICENSE.md)
[![build][badge-travis]](https://travis-ci.org/metaist/duil.js)
[![releases][badge-release]][Latest Release]
[![hits][badge-jsdelivr]](https://www.jsdelivr.com/package/npm/duil)

[Latest Release]: https://github.com/metaist/duil.js/releases/latest
[Documentation]: https://metaist.github.io/duil.js/
[Issues]: https://github.com/metaist/duil.js/issues

[badge-version]: https://img.shields.io/badge/version-0.3.2-blue.svg
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg
[badge-travis]: https://travis-ci.org/metaist/duil.js.svg?branch=master
[badge-release]: https://img.shields.io/github/downloads/metaist/duil.js/total.svg
[badge-jsdelivr]: https://data.jsdelivr.com/v1/package/npm/duil/badge

## Why?
You already know HTML and JavaScript, why should you learn a new syntax just to render templates and make components? You just need a something that updates when its data changes.

## Getting Started
Download the [latest release][Latest Release] or include the following code on your page:
```html
<script src="https://cdn.jsdelivr.net/npm/duil@0.3.2/dist/duil.min.js"></script>
```

For NodeJS:
```
yarn add duil
```

## Example
Here is a simple Hello World widget, taken from the [React] documentation:
```javascript
var HelloMessage = new duil.Widget({
  $dom: $('<div>'),
  name: '',

  //@override
  render: function () {
    this.$dom.text('Hello ' + this.name);
    return this;
  }
});

HelloMessage.set({name: 'John'});
HelloMessage.set({name: 'John'}); // nothing new; no re-render
```

Let's walk through this example.

1. First, we construct a `duil.Widget` passing it the properties we want it to have.
2. Next, we add two properties: `$dom` which holds a `<div>` we'll be rendering to and `name` to hold the name to display.
3. We also add a method called `.render()` which will be called when any of the properties of the widget are changed using `.set()`. The actual rendering simply changes the text of the `<div>` to say `"Hello"` followed the `name`.
4. Last, we set the `name` of the widget to `"John"` which triggers a `.render()`. Note that if we had set `name` to the same thing it was already set to, it would not call `.render()` again.

[1]: https://reactjs.org/

## Goals & Non-Goals
1. The goal of duil is to make it easy to write simple single page web apps.
2. Ease of use by the developer writing an app is a higher priority than insanely fast performance.
3. Use of well-established syntax beats newfangled shiny thing.
4. It is a non-goal to support very complicated web apps like Gmail and Google Docs.

## Influenced By
- **2006**: [jQuery] standardized DOM manipulation across browsers. This made controlling the DOM much more accessible and less fragile.

- **2008**: [PURE] was one of the earliest examples I saw of using normal HTML for templating. It hooked into [jQuery], but using the directives didn't feel quite right because I always ended up using jQuery to move around the DOM and set the data myself.

- **2011**: [D3] was my first exposure to data-driven visualizations and the idea that changes in data correspond to changes in what you see. Although you could use D3 for manipulating DOM nodes, it felt a little harder than jQuery.

- **2013**: [React] popularized the idea of components that change when their underlying data changes. duil stems from this fundamental insight, but ditches the weird syntax.

[D3]: https://d3js.org/
[jQuery]: http://jquery.com/
[PURE]: https://pure-js.com/
[React]: https://reactjs.org/

## License
Licensed under the [MIT License].

[MIT License]: http://opensource.org/licenses/MIT
