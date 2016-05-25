define([
  'lodash',
  './duil.core'
], function (_, duil) {
  'use strict'; // build ignore:line

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
    _.extend(CustomWidget.prototype, baseprops); // added prototype props
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

  return duil.Widget; // build ignore:line
});
