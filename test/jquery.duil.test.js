import 'jsdom-global/register';
import test from 'tape';
import $ from 'jquery';
import '../src/jquery.duil';

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
    'prop:disabled': true,
    'toggleClass:special': true
  };
  const $dom = $('<input />').set(vals);

  t.is($dom.length, 1, 'DOM exists');
  t.is($dom.val(), vals.val, 'should match .val()');
  t.is($dom[0].value, vals.val, 'should match .value');
  t.is($dom.prop('disabled'), vals['prop:disabled'], 'should match prop');
  t.ok($dom.hasClass('special'));

  $dom.set({val: (index, prev) => `${prev} index ${index}`});
  t.is($dom.val(), `${vals.val} index 0`);

  $dom.set('prop:disabled', true);
  t.is($dom.prop('disabled'), vals['prop:disabled'], 'idempotent test');

  t.end();
});
