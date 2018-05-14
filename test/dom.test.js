try { delete require.cache[require.resolve('../dist/duil.min.js')]; }
catch (e) { /* empty */ }

const end_jsdom = require('jsdom-global')();
const $ = require('jquery');
global.$ = $; // for jQuery detection
const test = require('tape');
const duil = require('../dist/duil.min');

test('dom.find', (t) => {
  const html = '<div><ul><li>First</li><li>Second</li></ul></div>';
  const $dom = $(html);
  const query = 'li';
  const $result = duil.dom.find($dom, query);

  t.is($result[0], duil.dom.find($dom[0], query));
  t.is($result.text(), 'First');

  t.end();
});

test('dom.remove null', (t) => {
  t.is(duil.dom.remove(), null);
  t.is(duil.dom.remove(null), null);

  t.end();
});

test('dom.remove', (t) => {
  const html = '<div><ul><li>First</li><li>Second</li></ul></div>';
  const $dom = $(html);
  const query = 'li';
  const $tmpl = duil.dom.find($dom, query);

  t.is($tmpl, duil.dom.remove($tmpl));

  const dom = $(html)[0];
  const tmpl = duil.dom.find(dom, query);
  t.is(tmpl, duil.dom.remove(tmpl));

  t.end();
});

test('dom.text', (t) => {
  const text = 'text';
  const $dom = $('<div>');
  duil.dom.setText($dom, text);
  t.is($dom.text(), text);

  t.end();
});

end_jsdom();
