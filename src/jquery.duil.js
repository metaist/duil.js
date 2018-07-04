import * as _ from './lodash';
import $ from 'jquery';

/* eslint valid-jsdoc: 0 */

/**
  @external "jQuery.fn"
  @description
  * The [jQuery plugin](http://learn.jquery.com/plugins/) namespace.
  */
const jq = $;

/**
  @private
  @param {*} val The value to apply. Functions will be called to determine
    the actual value.
  @param {string} key The property to set.
  @returns {Object} The getter/setter, whether it's a class, and the value.
  */
const split = (val, key) => {
  const [fn, name] = key.split(/:(.*)/, 2); // split on first colon
  const $fn = name ?
    // eslint-disable-next-line no-invalid-this
    function (...args) { return jq.fn[fn].bind(this)(name, ...args); } :
    jq.fn[fn];

  return {
    fn: $fn, // getter / setter
    isClass: fn.endsWith('Class'),
    val: _.isFunction(val) ? val : () => val // value function
  };
};

/**
  @summary Set attributes of the selected DOM objects if they haven't changed.
  @description
  * `attr` is one of:
  *   - `html`
  *   - `text`
  *   - `val`
  *   - `attr:[name]`
  *   - `css:[name]`
  *   - `data:[name]`
  *   - `prop:[name]`
  *
  * These are called every time (i.e. no value check):
  *   - `addClass`
  *   - `removeClass`
  *   - `toggleClass:[name]`

  @function external:"jQuery.fn".set
  @param {String} [attr] The attribute to set.
  @param {*|Object} value The attribute value or a set of attribute/values.
  @returns {jQuery} The selected jQuery object for chaining.
  @example
  * $('<div>').set('html', 'New text');
  * $('<input />').set({
  *   'val': 'New value',
  *   'prop:disabled': true
  * });
  */
const $set = function (attr, value) {
  const rules = _.isPlainObject(attr) ?
    Object.entries(attr).map(([k, v]) => split(v, k)) :
    [split(value, attr)];

  // eslint-disable-next-line no-invalid-this
  return this.each((index, dom) => {
    const $dom = jq(dom);
    const className = dom.getAttribute('class');
    rules.forEach((rule) => {
      // get the previous and next values for the property
      const fn = rule.fn.bind($dom);
      const prev = rule.isClass ? className : fn();
      const next = rule.val.bind(dom)(index, prev);
      if (rule.isClass || prev !== next) { fn(next); } // change if different
    });// end for: all rules applied
  });// end for: all DOM nodes applied
};

// only install if jQuery-like API detected
/* istanbul ignore else  */
if (jq && jq.extend && jq.fn) {
  // console.log('jQuery detected');
  jq.fn.extend({set: $set});
}

export default $set
