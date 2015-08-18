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

  /** Data + UI + Loop = duil  */
  var duil = {};

  /** Versioning using semantic versioning. <http://semver.org> */
  duil.VERSION = '0.0.1';

  /// WIDGET ///

  /**
    Construct a data-driven UI widget.

    The constructor defines the initial properties and then calls `.init()` and
    `.render()`. Properties that are functions are bound so that `this` refers
    to the widget itself. Properties are updated using `.set()` which will call
    `.render()` if any of the properites are changed.

    @param {object} props The initial properties of this object.

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
    _.forOwn(props, function (val, prop) {
      this[prop] = _.isFunction(val) ? val.bind(this) : val;
    }, this);
    // properties are added; methods are bound to
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
    @param {object} props The initial properties of the widget.
    @property {jQuery} $dom The container for the list.
    @property {jQuery} $tmpl The template for a single item.
    @property {jQuery} $items The list items into which data will be rendered.
    @property {array} items The list data.
    @example

    $('body').append('<ul id="my-list"><li></li></ul>');

    var MyList = new duil.List({
      $dom: $('#my-list'),

      //@override
      init: function () {
        this.$tmpl = this.$dom.find('li').remove();
        this.$items = this.$dom.find('li');
        return this;
      }
    });

    MyList.set({items: [1, 2, 3]});
    // => <ul id="my-list"><li>1</li><li>2</li><li>3</li></ul>
  */
  duil.List = function (props) {
    this.$dom = $();
    this.$tmpl = $('<li />');
    this.$items = $();
    this.items = [];

    duil.Widget.call(this, props);
  };

  /** Extend duil.List with the duil.Widget prototype.*/
  duil.List.prototype = Object.create(duil.Widget.prototype);
  duil.List.constructor = duil.Widget;

  /**
    Return the DOM object to update.

    By default, return the nth DOM object in `this.$items`.

    @param {*} item The item data.
    @param {number} index The 0-based number of this object.
    @returns {jQuery} Returns the DOM object to update.
  */
  duil.List.prototype.key = function (item, index) {
    return this.$items.eq(index);
  };

  /**
    Add a DOM object.

    By default, clones `this.$tmpl`, updates it using `this.udpate()`, and then
    appends it to `this.$dom`.

    @param {*} item The item data.
    @param {number} index The 0-based number of this object.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.add = function (item, index) {
    var $item = this.$tmpl.clone();
    this.update(item, index, $item);
    this.$dom.append($item);
    return this;
  };

  /**
    Update a DOM object.

    By default, sets the text of the item to the item data.

    @param {*} item The item data.
    @param {number} index The 0-based number of this object.
    @param {jQuery} $item The DOM object to update.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.update = function (item, index, $item) {
    $item.text(item);
    return this;
  };

  /**
    Remove a DOM object.

    By default, removes the DOM object using jQuery.

    @param {jQuery} $item The DOM object to remove.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.remove = function ($item) {
    $item.remove();
    return this;
  };

  /**
    Render the widget when data changes.

    By default, reselect `this.$items` and stich `this.data` to them.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.render = function () {
    this.$items = $(this.$items.selector, this.$items.context);
    return this.stitch(this.items, this.$items);
  };

  /**
    Apply data to DOM objects.

    This method uses the `.key()` method to map the item data to the DOM.
    DOM objects that aren't found are created; those that are found are updated.
    Items that exist and were selected, but not updated, are removed.

    @param {array} items Array of item data.
    @param {jQuery} $items DOM objects into which data should be bound.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.stitch = function (items, $items) {
    var $touched = [];
    _.each(items, function (item, index) {
      var $item = this.key(item, index);
      if (!$item.length) { // add
        this.add(item, index);
      } else { // update
        this.update(item, index, $item);
        $touched.push($item);
      }//end if: add or update item
    }, this);

    this.remove($(_.difference($items, $touched))); // untouched removed
    return this;
  };

  /** Expose framework globally. */
  window.duil = duil;

  return duil;
}));
