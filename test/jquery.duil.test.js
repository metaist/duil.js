try { delete require.cache[require.resolve('../dist/duil.js')]; }
catch (e) { /* empty */ }

const end_jsdom = require('jsdom-global')();
const $ = require('jquery');
global.$ = $; // for jQuery detection
const test = require('tape');
const duil = require('../dist/duil'); // eslint-disable-line no-unused-vars

test('$.set installed', (t) => {
  t.ok($.extend);
  t.ok($.fn);
  t.ok($.fn.set);
  t.end();
});

test('$.set single', (t) => {
  const text = 'New text';
  const $dom = $('<div>').set('text', text);

  t.is($dom.length, 1, 'DOM exists');
  t.is($dom.text(), text, 'should match .text()');
  t.is($dom[0].textContent, text, 'should match textContent');

  t.end();
});

test('$.set multiple', (t) => {
  const vals = {
    'val': 'New value',
    'prop:disabled': true
  };
  const $dom = $('<input />').set(vals);

  t.is($dom.length, 1, 'DOM exists');
  t.is($dom.val(), vals.val, 'should match .val()');
  t.is($dom[0].value, vals.val, 'should match .value');
  t.is($dom.prop('disabled'), vals['prop:disabled'], 'should match prop');

  t.end();
});


end_jsdom();
