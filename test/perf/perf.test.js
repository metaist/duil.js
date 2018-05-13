/* eslint no-console: "off", yoda: "off", no-plusplus: "off" */

const end_jsdom = require('jsdom-global')();
const $ = require('jquery');
global.$ = $; // for jQuery detection
const test = require('tape');
const duil = require('../../dist/duil');

test('perf: textContent', (t) => {
  t.plan(0);
  const $dom = $('<div>');
  const dom = $dom[0];
  const times = 1E6;
  const widget = new duil.Widget({
    dom: dom, i: 0,
    render: function () {
      this.dom.textContent = this.i;
    }
  })

  console.time('native');
  for (let i = times; i >= 0; i--) { dom.textContent = i; }
  console.timeEnd('native');

  console.time('duil');
  for (let i = times; i >= 0; i--) { widget.set({i: i}); }
  console.timeEnd('duil');

  t.end();
});

test('perf: $.fn.text', (t) => {
  t.plan(0);
  const $dom = $('<div>');
  const times = 1E6;
  const widget = new duil.Widget({
    $dom: $dom, i: 0,
    render: function () {
      this.$dom.text(this.i);
    }
  })

  console.time('jQuery');
  for (let i = times; i >= 0; i--) { $dom.text(i); }
  console.timeEnd('jQuery');

  console.time('duil');
  for (let i = times; i >= 0; i--) { widget.set({i: i}); }
  console.timeEnd('duil');

  t.end();
});

end_jsdom();
