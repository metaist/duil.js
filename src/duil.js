/*! duil v0.0.1 - Copyright 2015 Metaist <http://opensource.org/licenses/MIT> */
;(function (factory) {
  'use strict';
  if ('function' === typeof define && define.amd) {
    define(['lodash', 'jquery'], factory);
  } else {
    factory(window._, window.jQuery);
  }//end if: loaded dependencies
}(function (_, $) {
  'use strict';

  /**
    Return a self-reference.
    @private
    @returns {Object} A reference to `this`.
  */
  var noop = function () { return this; };

  /** Data + UI + Loop = duil  */
  var duil = {};

  /** Versioning using semantic versioning. <http://semver.org> */
  duil.VERSION = '0.0.1';

  /// UTILITIES ///

  /**
    Construct a CustomWidget class.

    Use this function to create a class that can be instantiated multiple times.
    @param {Object} baseclass Widget to be extended.
    @param {Object} baseprops Initial properties to be added to the constructor.
    @returns {duil.Widget} Returns a constructor for a custom widget.
    @example

    var NumberWidget = duil.extend(duil.Widget, {val: 42});
    var MyNumber = new NumberWidget();
    console.log(MyNumber.val);
    // => 42

    var YourNumber = new NumberWidget({val: 24});
    console.log(YourNumber.val);
    // => 24
  */
  duil.extend = function (baseclass, baseprops) {
    if (!baseclass) { baseclass = duil.Widget; }
    if (!baseprops) { baseprops = {}; }

    var CustomWidget = function (props) {
      if (!(this instanceof CustomWidget)) { return new CustomWidget(props); }

      this.set(baseprops, false);
      baseclass.call(this, props);
    };

    // Extend prototype for inheritence.
    CustomWidget.prototype = Object.create(baseclass.prototype);
    CustomWidget.constructor = baseclass;

    return CustomWidget;
  };

  /// WIDGET ///

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
  duil.Widget.prototype.init = noop;


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
    _.forOwn(props, function (val, prop) {
      if (!_.isEqual(_.get(this, prop), val)) {
        _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
        doRender = true;
      }//end if: changed properties are updated
    }, this);

    if (_.isBoolean(force)) { doRender = force; }
    return doRender ? this.render() : this;
  };


  /// LIST ///

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
  duil.List = duil.extend(duil.Widget, {
    $dom: $(),
    $tmpl: $('li'),
    selector: 'li',
    data: [],
  });

  /**
    Initialize the list.

    By default, select the first item in the list as the template.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.init = function () {
    this.$tmpl = this.$dom.find(this.selector).remove();
    return this;
  };

  /**
    Return the DOM object to update.

    By default, return the nth DOM object in the list items.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @returns {jQuery} Returns the DOM object to update.
  */
  duil.List.prototype.key = function (data, index) {
    return this.$dom.find(this.selector).eq(index);
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

    By default, reselect the DOM items and stich `this.data` to them.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.render = function () {
    return this.stitch(this.data, this.$dom.find(this.selector));
  };

  /**
    Apply data to DOM objects.

    This method uses the `.key()` method to map the item data to the DOM.
    DOM objects that aren't found are created; those that are found are updated.
    Items that exist and were selected, but not updated, are removed.

    @param {Array} data Array of item data.
    @param {jQuery} $items DOM objects into which data should be bound.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.stitch = function (data, $items) {
    var touched = [];
    _.each(data, function (datum, index) {
      var $item = this.key(datum, index);
      if (!$item.length) { // add
        this.add(datum, index);
      } else { // update
        this.update(datum, index, $item);
        touched.push($item.get()[0]);
      }//end if: add or update item
    }, this);

    this.remove($items.not(touched)); // untouched removed
    return this;
  };

  /** Expose framework globally. */
  window.duil = duil;

  return duil;
}));
