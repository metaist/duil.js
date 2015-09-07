define(['lodash', 'jquery'], function (_, $) {
  /**
    Set attributes of the selected DOM objects if they haven't changed.

    @param {Boolean} [force] If true, don't check for equality.
    @param {String} [attr] The attribute to set. One of:
      - text
      - html
      - val
      - prop:[name]
      - attr:[name]
    @param {*|Object} value The attribute value or a set of attribute/values.
    @example

    $('<div>').set('New text');
    $('<input />').set({
      'val': 'New value',
      'prop:disabled': true
    });
  */
  $.fn.extend({
    'set': function (attr, value) {
      var $this = $(this);
      var vals = {};
      if (_.isPlainObject(attr)) {
        vals = attr;
      } else if (_.isUndefined(value)) {
        if ($this.is(':input')) {
          vals['val'] = attr;
        } else {
          vals['text'] = attr;
        }//end if: default property set
      } else {
        vals[attr] = value;
      }//end if: have values

      _.forOwn(vals, function (val, attr) {
        var changeFunction = function (index, prev) {
          var check = val;
          if (_.isFunction(val)) { check = val(index, prev); }
          if (prev !== check || 'val' === attr) { return check; }
        };

        if (_.contains(attr, ':')) {
          var parts = attr.split(':');
          $this[parts[0]](parts[1], changeFunction);
        } else {
          $this[attr](changeFunction);
        }
      });

      return $this;
    }
  });
});
