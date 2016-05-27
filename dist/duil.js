/*! duil.js v0.1.3 | (c) 2016 Metaist LLC | MIT License */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["jquery","lodash"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'));
  } else {
    root.duil = factory(root.jQuery, root._);
  }
}(this, function($, _) {

  'use strict';

  /** Data + UI + Loop = duil  */
  var duil = {};

  /** Semantic Version <http://semver.org> */
  duil.VERSION = '0.1.3';

  /**
    Construct a data-driven UI widget.

    The constructor defines the initial properties and then calls `.init()` and
    `.render()`. Properties that are functions are bound so that `this` refers
    to the widget itself. Properties are updated using `.set()` which will call
    `.render()` if any of the properites are changed.

    @param {Object} props The initial properties of this object.

    @example

    var MyWidget = new duil.Widget({
      value: 5,
      method: function () { return this.value; }
    });

    // properties are added as expected
    console.log(MyWidget.value);
    // => 5

    // functions are bound to the widget
    console.log(MyWidget.method());
    // => 5
  */
  duil.Widget = function (props) {
    if (!(this instanceof duil.Widget)) { return new duil.Widget(props); }

    this.set(props, false);
    this.init();
    this.render();
  };

  /**
    Return a subclass of duil.Widget with the given base properties.

    @param {Object} [baseprops] The prototype to provide to the subclass.
    @returns {Object} Returns the subclass constructor.
    @example

    var NumberWidget = duil.Widget.subclass({val: 42});
    var MyNumber = new NumberWidget();
    console.log(MyNumber.val);
    // => 42

    var YourNumber = new NumberWidget({val: 24});
    console.log(YourNumber.val);
    // => 24
  */
  duil.Widget.subclass = function (baseprops) {
    if (!baseprops) { baseprops = {}; }
    var baseclass = this;
    var CustomWidget = function (props) {
      if (!(this instanceof CustomWidget)) { return new CustomWidget(props); }
      baseclass.call(this, props);
    };

    // Extend prototype for inheritence.
    CustomWidget.prototype = Object.create(baseclass.prototype);
    CustomWidget.prototype.__superclass__ = baseclass;
    CustomWidget.constructor = baseclass;
    _.assignIn(CustomWidget.prototype, baseprops); // added prototype props
    _.forOwn(baseclass, function (val, prop) {
      CustomWidget[prop] = val;
    }); // added own properties

    return CustomWidget;
  };

  /**
    Return property or method call on the superclass.

    The optional `parent` parameter allows you to specify a class further up
    the prototype chain to use as the parent.

    @param {Object} [parent] The class to inspect (default: immediate parent).
    @param {String} prop Name of the property to retreive.
    @param {...*} [params] Arguments to pass, if property is a method.
    @returns {*} Returns the property or method result from the superclass.
    @example

    var WidgetA = duil.Widget.subclass({
      name: 'WidgetA',
      say: function (punct) {
        return 'I am ' + this.name + (punct || '');
      }
    });

    var a = new WidgetA();
    a.say();
    // => 'I am WidgetA'

    var WidgetB = WidgetA.subclass({
      name: 'WidgetB',
      punct: '!',
      say: function () {
        return this.superclass('say', this.punct);
      }
    });

    var b = new WidgetB({name: 'Bob'});
    b.say();
    // => 'I am Bob!'

    var WidgetC = WidgetB.subclass({
      name: 'WidgetC',
      say: function (insult) {
        return this.superclass(WidgetA, 'say', ', ' + insult) +
               this.superclass('punct');
      }
    });

    var c = new WidgetC({name: 'Sparticus'});
    c.say('you fool');
    // => 'I am Sparticus, you fool!'
  */
  duil.Widget.prototype.superclass = function (parent, prop, params) {
    if (_.isString(parent)) {
      prop = parent;
      parent = this.__superclass__;
      params = _.slice(arguments, 1);
    } else {
      params = _.slice(arguments, 2);
    }//end if: args processed

    var result = parent.prototype;
    if (prop) { result = result[prop]; }
    if (_.isFunction(result)) { result = result.apply(this, params); }
    return result;
  };

  /**
    Initialize the widget.

    This method is called when the widget is constructed. Instances should
    override this method.

    Common uses of the `.init()` method:
      - binding event handlers
      - triggering one-time operations (e.g., ajax requests)

    @returns {duil.Widget} Returns the widget itself for chaining.
    @example

    var MyWidget = new duil.Widget({
      // @override
      init: function () {
        this.value = 42;
        return this;
      }
    });

    console.log(MyWidget.value);
    // => 42
  */
  duil.Widget.prototype.init = function () { return this; };

  /**
    Render the widget based on its state.

    This method is called when the widget is constructed and when the properties
    are changed using `.set()`. Instances should override this method.

    @returns {duil.Widget} Returns the widget itself for chaining.
    @example

    var MyWidget = new duil.Widget({
      $dom: $('#my-widget'),
      count: 0,

      // @override
      init: function () {
        this.$dom.click(this.click);
        return this;
      },

      // @override
      render: function () {
        this.$dom.text(this.count);
        return this;
      },

      // increment the count when the widget is clicked
      click: function () {
        this.set({count: this.count + 1});
        return this;
      }
    });
  */
  duil.Widget.prototype.render = function () { return this; };

  /*
    Update properties of the widget.

    The `force` parameter controls when `.render()` is called:
      - If `true`, always call `.render()`.
      - If `false`, never call `.render()`.
      - Otherwise (e.g. `undefined`), only call `.render()` when the properties
        are updated.

    @param {object} props The new widget properties.
    @param {boolean} [force] Force calling `.render()` after property updates.
    @example

    var MyWidget = new duil.Widget({
      'stats.count': 42
    });

    MyWidget.set({'stats.count': MyWidget.stats.count + 1});
    console.log(MyWidget.stats.count);
    // => 43
  */
  duil.Widget.prototype.set = function (props, force) {
    var doRender = false;
    if (_.isBoolean(force)) { // cheap; no checking
      doRender = force;
      _.forOwn(props, _.bind(function (val, prop) {
        _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
      }, this));
    } else { // expensive; equality checking
      _.forOwn(props, _.bind(function (val, prop) {
        if (!_.isEqual(_.get(this, prop), val)) {
          _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
          doRender = true;
        }//end if: changed properties are updated
      }, this));
    }//end if: short path

    if (doRender) { this.render(); }
    return this;
  };

  /*
    Construct a data-driven list widget.

    The list widget helps represent changes in list of objects. By convention,
    it uses certain properties and methods to help manage the list.

    @extends duil.Widget
    @param {Object} props The initial properties of the widget.
    @property {jQuery} $dom The container for the list.
    @property {jQuery} $tmpl The template for a single item.
    @property {String} selector The selector for the list items.
    @property {Array} data The list data.
    @example

    $('body').append('<ul id="my-list"><li></li></ul>');

    var MyList = new duil.List({
      $dom: $('#my-list'),

      //@override
      init: function () {
        this.$tmpl = this.$dom.find('li').remove();
        return this;
      }
    });

    MyList.set({data: [1, 2, 3]});
    // => <ul id="my-list"><li>1</li><li>2</li><li>3</li></ul>
  */
  duil.List = duil.Widget.subclass({
    $dom: $(),
    $tmpl: $('li'),
    selector: 'li',
    data: [],
  });

  /**
    Initialize the list.

    By default, the template is a detached DOM node using `this.items()`.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.init = function () {
    this.$tmpl = this.items().remove();
    return this;
  };

  /**
    Return the DOM objects that can be updated.

    By default, this function finds `this.selector` within `this.$dom`.

    @returns {jQuery} Returns the DOM objects that can be selected.
  */
  duil.List.prototype.items = function () {
    return this.$dom.find(this.selector);
  };

  /**
    Return the DOM object to update.

    By default, return the nth DOM object in the list items.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @returns {jQuery} Returns the DOM object to update.
  */
  duil.List.prototype.key = function (data, index) {
    return this.items().eq(index);
  };

  /**
    Add a DOM object.

    By default, clones `this.$tmpl`, updates it using `this.udpate()`, and then
    appends it to `this.$dom`.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.add = function (data, index) {
    var $item = this.$tmpl.clone();
    this.update(data, index, $item);
    this.$dom.append($item);
    return this;
  };

  /**
    Update a DOM object.

    By default, sets the text of the item to the item data.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @param {jQuery} $item The DOM object to update.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.update = function (data, index, $item) {
    $item.text(data);
    return this;
  };

  /**
    Remove a DOM object.

    By default, removes the DOM object using jQuery.

    @param {jQuery} $items The DOM objects to remove.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.remove = function ($items) {
    $items.remove();
    return this;
  };

  /**
    Render the widget when data changes.

    By default, reselect the DOM items and stitch `this.data` to them.

    This method uses the `.key()` method to map the item data to the DOM.
    DOM objects that aren't found are created; those that are found are updated.
    Items that exist and were selected, but not updated, are removed.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.render = function () {
    var $items = this.items();
    var touched = [];
    _.forEach(this.data, _.bind(function (data, index) {
      var $item = this.key(data, index);
      if (!$item.length) { // add
        this.add(data, index);
      } else { // update
        this.update(data, index, $item);
        touched.push($item.get()[0]);
      }//end if: add or update item
    }, this));

    this.remove($items.not(touched)); // untouched removed
    return this;
  };

  

  /**
    Set attributes of the selected DOM objects if they haven't changed.

    @param {String} [attr] The attribute to set. One of:
      - html
      - text
      - val
      - attr:[name]
      - css:[name]
      - data:[name]
      - prop:[name]

      These are called every time (i.e. no value check):
      - addClass
      - removeClass
      - toggleClass:[name]
    @param {*|Object} value The attribute value or a set of attribute/values.
    @example

    $('<div>').set('html', New text');
    $('<input />').set({
      'val': 'New value',
      'prop:disabled': true
    });
  */
  $.fn.extend({
    'set': function (attr, value) {
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
    }
  });

return duil;

}));
