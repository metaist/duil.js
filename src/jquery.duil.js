import * as _ from './lodash';

/**
  @external "jQuery.fn"
  @description
  * The [jQuery plugin](http://learn.jquery.com/plugins/) namespace.
  */

/**
  @summary
  Set attributes of the selected DOM objects if they haven't changed.

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
const jQuery_set = function(attr, value) {
  var vals = {};
  var rules = [];

  if (_.isPlainObject(attr)) { // multiple
    vals = attr;
  } else { // single
    vals[attr] = value;
  }//end if: have values

  rules = _.map(vals, function (val, fn) {
    var name = null;
    var pos = fn.indexOf(':');
    if (-1 !== pos) {
      name = fn.substr(pos + 1);
      fn = fn.substring(0, pos);
    }//end if: split on first colon

    return {
      fn: fn,
      name: name,
      val: _.isFunction(val) ? val : _.constant(val)
    };
  });

  return this.each(function (index, dom) {
    var $dom = $(dom);
    _.forEach(rules, function (rule) {
      var fn = _.bind($dom[rule.fn], $dom);
      if (rule.name) { fn = _.partial(fn, rule.name); }

      var is_class = _.endsWith(rule.fn, 'Class');
      var prev = is_class ? $dom.attr('class') : fn();
      var val = _.bind(rule.val, dom)(index, prev);
      if (is_class || prev !== val) { fn(val); }
    });//end for: all rules applied
  });//end for: all DOM nodes applied
};

if (global.$ && global.$.extend && global.$.fn) {
  global.$.extend(global.$.fn, {set: jQuery_set});
}//end if: jQuery_set exposed only if jQuery (or similar substitute exists)

export default jQuery_set;
