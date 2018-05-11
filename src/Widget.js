import * as _ from './lodash';

/**
  @classdesc A widget is an object that re-renders when its data changes.
  @summary Object that re-renders when its data changes.
  @memberof duil
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
  * Unlike previous versions of duil, the use of the `new` keyword is required.

  @param {Object} props Initial properties of this object.
  @example
  * var thing = new duil.Widget({
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
class Widget {
  constructor(props) {
    this.set(props, false);
    this.init();
    this.render();
  }

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
  init() { return this; }

  /**
    @summary Render the widget based on its state.
    @description
    * This method is called when the widget is constructed and when the
    * properties are changed using [.set()](#set).
    *
    * Subclasses and instances should override this method.
    *
    * **NOTE**: This method does not take any parameters; the goal of this
    * method is to make the widget reflect the current state. Because this
    * method may be called frequently, it is best not to use expensive
    * operations and to make calls idempotent--don't change things that are
    * already in the correct state.
    *
    * duil provides a utility function for jQuery called
    * [.set](./external-_jQuery.fn_.html#.set) to help set attributes of DOM
    * nodes in an idempotent way.

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
  render() { return this; }

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
  set(props, force) {
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
        }// end if: changed properties are updated
      });
    }// end if: check force rendering

    if (doRender) { this.render(); } //
    return this;
  }
}

export default Widget;
