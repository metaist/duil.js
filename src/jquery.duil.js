import * as _ from './lodash';
/* eslint valid-jsdoc: 0 */

/**
  @external "jQuery.fn"
  @description
  * The [jQuery plugin](http://learn.jquery.com/plugins/) namespace.
  */

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
const jQuery_set = function (attr, value) {
  const split = (val, key) => {
    const [fn, name] = key.split(/:(.*)/, 2); // split on first colon
    return {
      // the property getter / setter
      fn: fn, name: name,
      isClass: fn.endsWith('Class'),
      val: _.isFunction(val) ? val : () => val // the value to set
    };
  };
  const rules = _.isPlainObject(attr) ?
    _.map(attr, split) : [split(value, attr)];

  // eslint-disable-next-line no-invalid-this
  return this.each((index, dom) => {
    var $dom = $(dom); // eslint-disable-line no-undef
    _.forEach(rules, (rule) => {
      const fn = rule.name ?
        (...args) => $dom[rule.fn].bind($dom)(rule.name, ...args) :
        $dom[rule.fn].bind($dom);

      // get the previous and next values for the property
      const prev = rule.isClass ? dom.getAttribute('class') : fn();
      const next = rule.val.bind(dom)(index, prev);
      if (rule.isClass || prev !== next) { fn(next); } // change if different
    });// end for: all rules applied
  });// end for: all DOM nodes applied
};

// eslint-disable-next-line no-new-func
var top = Function('return this')() || global;
if (top.$ && top.$.extend && top.$.fn) {
  top.$.extend(top.$.fn, {set: jQuery_set});
}// end if: exposed only if jQuery-like API exists

export default jQuery_set;
