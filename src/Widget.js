import * as _ from './lodash';

/**
  @classdesc
  A widget is an object that re-renders when its data changes.

  @summary Object that re-renders when its data changes.
  @description
  * The constructor defines the initial properties and then calls
  * [.init()](#init) followed by [.render()](#render).
  *
  * Properties that are functions are bound so that `this` refers to the widget
  * itself so that they act like methods of the widget.
  *
  * In general, you should use [.set()](#set) to update properties which will
  * call [.render()](#render) if any of the properites are actually changed.
  *
  * The use of the `new` keyword is optional and this function will act as a
  * factory method if it is omitted.

  @constructor
  @memberof duil
  @param {Object} props Initial properties of this object.
  @returns {duil.Widget} Returns a new {@link duil.Widget} instance.
  @example
  * var thing = duil.Widget({
  *   value: 5,
  *   method: function () { return this.value; }
  * });
  *
  * // properties are added as expected
  * console.log(thing.value);
  * // => 5
  *
  * // functions are bound to the widget
  * console.log(thing.method());
  * // => 5
  */
var Widget = function (props) {
  if (!(this instanceof Widget)) { return new Widget(props); }

  this.set(props, false);
  this.init();
  this.render();
};

/**
  @summary Create a subclass of {@link duil.Widget}.

  @static
  @param {Object} [baseprops] Prototype to provide to the subclass.
  @returns {Object} Returns the subclass constructor for the custom widget.
  @example
  * var NumberWidget = duil.Widget.subclass({val: 42});
  * var MyNumber = new NumberWidget();
  * console.log(MyNumber.val);
  * // => 42
  *
  * var YourNumber = new NumberWidget({val: 24});
  * console.log(YourNumber.val);
  * // => 24
  */
Widget.subclass = function (baseprops) {
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
  _.forOwn(baseclass, (val, prop) => CustomWidget[prop] = val);
  // added own properties

  return CustomWidget;
};

/**
  @summary Return property or method call on the superclass.
  @description
  * The optional `parent` parameter allows you to specify a class further up
  * the prototype chain to use as the parent or a completely different class.

  @param {Object} [parent] Class to inspect (default: immediate parent).
  @param {string} prop Name of the property to retreive.
  @param {...*} [params] Arguments to pass, if property is a method.
  @returns {*} Returns the property or method result from the superclass.
  @example
  * var WidgetA = duil.Widget.subclass({
  *   name: 'WidgetA',
  *   say: function (punct) {
  *     return 'I am ' + this.name + (punct || '');
  *   }
  * });
  *
  * var a = new WidgetA();
  * a.say();
  * // => 'I am WidgetA'
  *
  * var WidgetB = WidgetA.subclass({
  *   punct: '!',
  *
  *   // @override
  *   name: 'WidgetB',
  *
  *   // @override
  *   say: function () {
  *     return this.superclass('say', this.punct);
  *   }
  * });
  *
  * var b = new WidgetB({name: 'Bob'});
  * b.say();
  * // => 'I am Bob!'
  *
  * var WidgetC = WidgetB.subclass({
  *   // @override
  *   name: 'WidgetC',
  *
  *  // @override
  *  say: function (insult) {
  *    return this.superclass(WidgetA, 'say', ', ' + insult) +
  *           this.superclass('punct');
  *   }
  * });
  *
  * var c = new WidgetC({name: 'Sparticus'});
  * c.say('you fool');
  * // => 'I am Sparticus, you fool!'
  */
Widget.prototype.superclass = function (parent, prop, params) {
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
  @summary Initialize the widget.
  @description
  * This method is called when the widget is constructed. Instances will often
  * override this method.
  *
  * The default method does nothing but return the widget.
  *
  * Common uses of the [.init()](#init) method:
  *   - binding event handlers
  *   - triggering one-time operations (e.g., ajax requests)

  @returns {duil.Widget} Returns the widget itself for chaining.
  @example
  * var MyWidget = new duil.Widget({
  *   // @override
  *   init: function () {
  *     this.value = 42;
  *     return this;
  *   }
  * });
  *
  * console.log(MyWidget.value);
  * // => 42
  */
Widget.prototype.init = function () { return this; };

/**
  @summary Render the widget based on its state.
  @description
  * This method is called when the widget is constructed and when the
  * properties are changed using [.set()](#set).
  *
  * Subclasses and instances should override this method.
  *
  * **NOTE**: This method does not take any parameters; the goal of this method
  * is to make the widget reflect the current state. Because this method may be
  * called frequently, it is best not to use expensive operations and to make
  * calls idempotent--don't change things that are already in the correct state.
  *
  * duil provides a utility function for jQuery called [.set](./jquery.duil.js.html)
  * to help set attributes of DOM nodes in an idempotent way.

  @returns {duil.Widget} Returns the widget itself for chaining.
  @example
  * var MyWidget = new duil.Widget({
  *   $dom: $('#my-widget'),
  *   count: 0,
  *
  *   // @override
  *   init: function () {
  *     this.$dom.click(this.click);
  *     return this;
  *   },
  *
  *   // @override
  *   render: function () {
  *     this.$dom.text(this.count);
  *     return this;
  *   },
  *
  *   // increment the count when the widget is clicked
  *   click: function () {
  *     this.set({count: this.count + 1});
  *     return this;
  *   }
  * });
  */
Widget.prototype.render = function () { return this; };

/**
  @summary Update properties of the widget.
  @description
  * The `force` parameter controls when `.render()` is called:
  *    - If `true`, always call `.render()`.
  *    - If `false`, never call `.render()`.
  *    - Otherwise (e.g. `undefined`), only call `.render()` when the
  *      properties are actually changed.

  @param {Object} props The new widget properties.
  @param {boolean} [force] Force calling `.render()` after property updates.
  @returns {duil.Widget} Returns the widget itself for chaining.
  @example
  * var MyWidget = new duil.Widget({
  *   'stats.count': 42
  * });
  *
  * MyWidget.set({'stats.count': MyWidget.stats.count + 1});
  * console.log(MyWidget.stats.count);
  * // => 43
  */
Widget.prototype.set = function (props, force) {
  var doRender = false;
  if (true === force || false === force) { // cheap; no checking
    doRender = force;
    _.forOwn(props, (val, prop) => {
      _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
    });
  } else { // expensive; equality checking
    _.forOwn(props, (val, prop) => {
      if (!_.isEqual(_.get(this, prop), val)) {
        _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
        doRender = true;
      }//end if: changed properties are updated
    });
  }//end if: check force rendering

  if (doRender) { this.render(); }
  return this;
};

export default Widget;
