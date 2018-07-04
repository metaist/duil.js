import * as _ from './lodash';
import {diff} from './diff';
import {hidden} from './consts';

/**
  @constructor
  @memberof duil
  @classdesc A widget is an object that re-renders when its data changes.
  @summary Object that re-renders when its data changes.
  @param {Object} props Initial properties of this widget.
  @description
  * The constructor defines the initial properties and then calls
  * [.init()](#init) followed by [.render()](#render).
  *
  * Properties that are functions are bound to the widget itself so that they
  * act like methods (`this` refers to the widget). This means that you cannot
  * use arrow-style functions for the methods because they cannot be bound.
  *
  * In general, you should use [.set()](#set) to update properties which will
  * call [.render()](#render) if any of the properites are actually changed.
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
    this[hidden] = {
      changes: null,
      handlers: {}
    };

    this.set(props, false);
    this.init();
    this.render();
  }

  /**
    @summary Initialize the widget.
    @fires duil#init
    @returns {duil.Widget} The widget itself for chaining.
    @description
    * This method is called when the widget is constructed. Instances will often
    * override this method.
    *
    * The default method simply fires {@link duil#event:init|init} and returns
    * the widget.
    *
    * Common uses of the [.init()](#init) method:
    *   - binding event handlers
    *   - triggering one-time operations (e.g., ajax requests)
    *   - initializing variables that are not available during construction
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
  init() {

    /**
      @event duil#init
      @summary Fired when widget is initialized.
      @property {string} type='init' The event type.
      @property {string} target=this The widget itself.
      @property {Object} data={} The data payload.
    */
    return this.trigger('init');
  }

  /**
    @summary Render the widget based on its state.
    @param {Object|null} changes The changes that occured to this widget. See
      {@link duil.diff} for the details of the format.
    @fires duil#render
    @returns {duil.Widget} Returns the widget itself for chaining.
    @description
    * This method is called when the widget is constructed and when the
    * properties are changed using [.set()](#set).
    *
    * Subclasses and instances should override this method because the default
    * method will fire {@link duil#event:render|render} if the `changes`
    * parameter is not falsy and return the widget.
    *
    * NOTE: The goal of this method is to make the widget reflect its current
    * state. Because this method may be called frequently, it is best to perform
    * changes in an idempotent way--don't change things already in their correct
    * state.
    *
    * The `changes` parameter can help as well as a duil utility function for
    * jQuery called [.set](./external-_jQuery.fn_.html#.set) that can set
    * DOM attributes in an idempotent way.
    @example
    * var MyWidget = new duil.Widget({
    *   $dom: $('#my-widget'),
    *   count: 0,
    *
    *   // @override
    *   init: function () {
    *     this.$dom.click(this.click);
    *     return this.trigger('init');
    *   },
    *
    *   // @override
    *   render: function () {
    *     // our rendering is simple, so we re-render each time
    *     this.$dom.text(this.count);
    *     return this.trigger('render');
    *   },
    *
    *   // increment the count when the widget is clicked
    *   click: function () {
    *     this.set({count: this.count + 1});
    *     return this;
    *   }
    * });
    */
  render(changes) {
    if (!changes) { return this; }

    /**
      @event duil#render
      @summary Fired when widget finishes rendering.
      @property {string} type='render' The event type.
      @property {string} target=this The widget itself.
      @property {Object} data={} The data payload.
    */
    return this.trigger('render');
  }

  /**
    @summary Update properties of the widget.
    @param {Object} props The new widget properties.
    @param {boolean} [force] Force calling `.render()` after property updates.
    * Note that this also forces whether the `change` event is triggered
    * regardless of whether any changes occur.
    @fires duil#change
    @returns {duil.Widget} Returns the widget itself for chaining.
    @description
    * Update the widget's properties.
    *
    * The keys `props` of the parameter can be dotted paths to lookup values in
    * the widget.
    *
    * The `force` parameter controls when `.render()` is called:
    * - If `true`, always call `.render()` and fire
    *   {@link duil#event:change|change}.
    * - If `false`, never call `.render()` or fire
    *   {@link duil#event:change|change}.
    * - Otherwise (e.g. `undefined`), only call `.render()` (and fire
    *   {@link duil#event:change|change}) when the properties are actually
    *   changed.
    @example
    * var MyWidget = new duil.Widget({
    *   stats: { count: 42 }
    * });
    *
    * // you can used dotted paths to refer to the field to change
    * MyWidget.set({'stats.count': MyWidget.stats.count + 1});
    * console.log(MyWidget.stats.count);
    * // => 43
    */
  set(props, force) {
    const ns = this[hidden];
    const changes = {};
    Object.entries(props || {}).forEach(([prop, val]) => {
      const prev = _.get(this, prop);
      if (!_.isEqual(prev, val)) {
        Object.assign(changes, diff(prev, val, prop));
        _.set(this, prop, _.isFunction(val) ? val.bind(this) : val);
      }
    });// found all changes

    ns.changes = changes;
    if (true === force || (false !== force && Object.keys(changes).length)) {
      this.render(changes);

      /**
        @event duil#change
        @summary Fired when widget data changes or {@link duil.Widget#set} is
          called with `force=true`.
        @property {string} type='change' The event type.
        @property {string} target=this The widget itself.
        @property {Object} data.changes={changes} The data payload.
        */
      this.trigger('change', {changes: changes});
    }// end if: rendered and triggered changes, if necessary
    return this;
  }

  /**
    @summary Register a handler to be called when events occur in this widget.
    @param {string} type The name of the event to listen to. Specify multiple
      events by separating them with a comma.
    @param {Function} handler The function to call when an event occurs.
    @returns {Widget} Returns the widget itself for chaining.
    @description
    * The `type` parameter can be a comma-separated list of event names; the
    * `handler` will be bound to all of the events given. There is also a
    * special global event name `*`. Handlers registered to this event will
    * receive every event that occurs on this object. In such cases where the
    * same handler is receiving multiple event types, use the `.type` property
    * of the event to determine which kind of event is being detected.
    *
    * Basic Widget events are:
    * - {@link duil#event:init|init}
    * - {@link duil#event:render|render}
    * - {@link duil#event:change|change}
    @example
    * var widget = new Widget();
    * widget.on('my-event-name', (e) => console.log(e.data));
    * widget.trigger('my-event-name', {value: 42});
    * // => {value: 42}
    */
  on(type, handler) {
    const ns = this[hidden].handlers;
    type.split(',').forEach((evt) => {
      if (!ns[evt]) { ns[evt] = []; }
      ns[evt].push(handler);
    });
    return this;
  }

  /**
    @summary Remove an event handler from this widget.
    @param {string} [type='*'] The name of the event. Specify multiple events
      by separating them with a comma. By default, the handler is removed from
      all events.
    @param {Function} [handler] The function that was used to respond to events.
      If omitted, all handlers for this event will be removed.
    @returns {Widget} Return the widget itself for chaining.
    @example
    * var widget = new Widget();
    * var handler = function (e) { console.log(e.data); };
    * widget.on('my-event,other-event', handler);
    * widget.off('my-event', handler); // still listening on other-event
    * widget.off('other-event'); // all handlers for other-event removed
    */
  off(type, handler) {
    const ns = this[hidden].handlers;
    const events = (type && type.split(',')) || Object.keys(ns);
    events.forEach((evt) => {
      ns[evt] = handler && ns[evt] ?
        ns[evt].filter(f => f !== handler) :
        [];
    });
    return this;
  }

  /**
    @summary Trigger an event on this widget.
    @param {string} type The name of the event to trigger. Trigger multiple
      events by separating event names with a comma.
    @param {Object} [data={}] Extra data to pass to the event.
    @returns {Widget} Returns the widget itself for chaining.
    @example
    * var widget = new Widget();
    * var handler = function (e) { console.log(e.type, e.data); };
    * widget.on('my-event,other-event', handler);
    * widget.trigger('my-event', 'only once');
    * // => "my-event" "only once"
    * widget.off('my-event,other-event', 'twice');
    * // => "my-event" "twice"
    * // => "my-event" "twice"
    */
  trigger(type, data) {
    type.split(',').forEach((evt) => {
      let handlers = this[hidden].handlers[evt] || [];
      const event = {type: evt, target: this, data: data || {}};
      handlers.forEach(handler => handler(event));

      if ('*' === evt) { return; } // cannot trigger all events
      handlers = this[hidden].handlers['*'] || [];
      handlers.forEach(handler => handler.call(this, event));
    });
    return this;
  }

  /**
    @summary Invoke a method from another class in the context of this widget.
    @param {Widget} parent The class with the method to invoke.
    @param {string} name The name of the method to invoke.
    @param {...*} args The arguments to pass to the method.
    @returns {*} Returns the result of invoking the method.
    @example
    * var widget = new Widget({
    *   // @override
    *   init: function () {
    *     // do something unique to this widget here
    *     // now do whatever Widget.init does, in the context of this Widget
    *     return this.invoke(Widget, 'init');
    *   }
    * });
    */
  invoke(parent, name, ...args) {
    return parent.prototype[name].apply(this, args);
  }
}

export default Widget;
