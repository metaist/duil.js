import 'jsdom-global/register'
import test from 'tape';
import $ from 'jquery';
import * as DOM from '../src/dom';

test('dom.find', (t) => {
  const html = '<div><ul><li>First</li><li>Second</li></ul></div>';
  const $dom = $(html);
  const query = 'li';
  const $result = DOM.find($dom, query);

  t.is($result[0], DOM.find($dom[0], query));
  t.is($result.text(), 'First');

  t.end();
});

test('dom.clone', (t) => {
  const html = '<div>Test</div>';
  const el = DOM.clone($(html)[0]);

  t.ok(el, 'expect an element');
  t.end();
});

test('dom.append', (t) => {
  const html = '<div></div>';
  const el = DOM.clone($(html)[0]);
  const child = $('<span>Test</span>')[0];

  DOM.append(el, child);
  t.same(el.children[0], child, 'expect child to be appended');

  t.end();
});

test('dom.remove null', (t) => {
  t.is(DOM.remove(), null);
  t.is(DOM.remove(null), null);

  t.end();
});

test('dom.remove', (t) => {
  const html = '<div><ul><li>First</li><li>Second</li></ul></div>';
  const $dom = $(html);
  const query = 'li';
  const $tmpl = DOM.find($dom, query);

  t.is($tmpl, DOM.remove($tmpl));

  const dom = $(html)[0];
  const tmpl = DOM.find(dom, query);
  t.is(tmpl, DOM.remove(tmpl));

  t.end();
});

test('dom.setText', (t) => {
  const text = 'text';
  const $dom = $('<div>');
  DOM.setText($dom, text);
  t.is($dom.text(), text);

  const el = $dom[0];
  DOM.setText(el, 'new text');
  t.is(el.textContent, 'new text', 'expect new text to be set');

  t.end();
});
