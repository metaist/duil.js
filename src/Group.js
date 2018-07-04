import Queue from './Queue';
import Widget from './Widget';
import {diff, merge} from './diff';
import {globalTop, hidden} from './consts';

/**
  @private
  @summary Default function that is used for draining a queue.
  @description
  By default, the first function that exists in the global namespace is used.
  Options are:
  - `requestAnimationFrame`
  - `setImmediate`
  - `setTimeout`
*/
const DEFAULT_DRAIN_METHOD = globalTop[[
  'requestAnimationFrame',
  'setImmediate',
  'setTimeout'
].find(f => f in globalTop)].bind(globalTop);

/**
  @constructor
  @memberof duil
  @extends duil.Widget
  @classdesc A group is a collection of models connected to views.
  @summary Collection of models connected to views.
  @param {Object} props Initial properties of the widget.
  @property {Object} data The data models for this group.
  @property {Object} views The objects that represent the models.
  @property {Object} config Configuration that controls rendering.
  @property {boolean} config.asyncRender Allow asynchronous render
    (default: `true`).
  @property {boolean} config.showWarning Show a console warning when using
    async render (default: `true`).
  @property {boolean} config.largeChange Number of changes that warrant
    switching to asynchronous rendering (default: `1000`).
  @property {number} config.drainGrowth Number of render steps scheduled after
    each change is processed (default: `4`). Setting this too high will cause
    renders to exceed their time window. Setting this too low will make
    rendering take a long time.
  @property {Function} config.drainMethod Function used to drain the queue of
    changes (default first of `requestAnimationFrame`, `setImmediate`, or
    `setTimeout` that exists). Must be bound to the global scope.
  @description
  * A group widget represents multiple objects backed by the same array of data.
  * It's purpose is to maintain the lifecycle of creating, updating, and
  * removing view-related objects in response to changes in the underlying data.
  *
  * For example, suppose you're drawing dots on a canvas. The attributes of each
  * dot are stored in `data` while the corresponding dot objects are in `views`.
  *
  * For DOM-related components, use {@link duil.List}.
  */
class Group extends Widget {
  constructor(props) {
    super(Object.assign({data: [], views: [], config: {}}, props));
  }

  /**
    @override
    @summary Initialize the group.
    @fires duil#init
    @returns {duil.Group} The group itself for chaining.
    @description
    * By default, set the async render configuration information and re-render
    * if there is any `data` property defined.
    */
  init () {
    this.config = Object.assign({
      asyncRender: true,
      showWarning: true,
      largeChange: 1000,
      drainGrowth: 4,
      drainMethod: DEFAULT_DRAIN_METHOD
    }, this.config);

    this.drain = this.drain.bind(this);
    Object.assign(this[hidden], {
      diff: null,
      queue: new Queue(),
      drain_count: 0
    });

    this.render(diff([], this.data, 'data'));
    return this.invoke(Widget, 'init');
  }

  /**
    Gets the view with the same id as the model.

    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Object|null} Returns the view or `null` if none is found.
   */
  static KEY_BY_ID(model, index) {
    if (!model || !model.id) { return null; }
    return this.views.find(view => view && view.id === model.id) || null;
  }

  /**
    @summary Get the view that corresponds to the given model.
    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Object} Returns the view or `null` if none is found.
    @description
    * This method is called during {@link Group.duil.render} to determine which
    * view should be updated.
    *
    * If this method returns `null`, a new view will be created.
    *
    * By default, this method assumes that both models and views are in the same
    * order. Alternatively, if they are in different orders, but have an `id`
    * property in common, you can used {@link duil.Group.KEY_BY_ID}.
    *
    * In general, you should not have to override this method unless your models
    * are not in a guaranteed order and it is cheaper to map from models to
    * views in some other way.
    */
  key(model, index) { return this.views[index] || null; }

  /**
    @summary Create a new view for a given model.
    @param {*} model The model that needs a new view.
    @param {number} index The index of the model.
    @fires duil#create
    @returns {Object} Returns the newly-created view.
    */
  create(model, index) {
    const view = this.update({}, model, index);
    this.views[index] = view;

    /**
      @event duil#create
      @summary Fired when an item in a group is created.
      @property {string} type='create' The event type.
      @property {string} target=this The widget itself.
      @property {Object} data.view The view.
      @property {Object} data.model The associated model.
      @property {Object} data.index The index of the model.
    */
    this.trigger('create', {view: view, model: model, index: index});
    return view;
  }

  /**
    @summary Update a view to match its model.
    @param {Object} view The view to update.
    @param {*} model The model for the view.
    @param {number} index The index of the model.
    @fires duil#update
    @returns {Object} Returns the now-updated view.
    */
  update(view, model, index) {
    Object.assign(view, model);

    /**
      @event duil#update
      @summary Fired when an item in a group is updated.
      @property {string} type='update' The event type.
      @property {string} target=this The widget itself.
      @property {Object} data.view The view.
      @property {Object} data.model The associated model.
      @property {Object} data.index The index of the model.
    */
    this.trigger('update', {view: view, model: model, index: index});
    return view;
  }

  /**
    @summary Remove the views that are no longer backed by a model.
    @param {Object} view The views to remove.
    @param {number} index The index of the view.
    @fires duil#remove
    @returns {duil.Group} Returns the group for chaining.
    @description
    * This function is similar to the d3 concept of
    * [exit()](https://github.com/d3/d3-selection/blob/master/README.md#selection_exit).
    * These are the views that no longer have data associated with them and
    * should be removed.
    * The defualt behavior is to simply remove them from the array of views.
    *
    * You should override this method to perform the appropriate clean up action
    * that disposes of the view.
   */
  remove(view, index) {
    this.views[index] = undefined;

    /**
      @event duil#remove
      @summary Fired when an item in a group is removed.
      @property {string} type='remove' The event type.
      @property {string} target=this The widget itself.
      @property {Object} data.view The view.
      @property {Object} data.index The previous index of the view.
    */
    this.trigger('remove', {view: view, index: index});
    return view;
  }

  /**
    @summary Update the mapping between models and views.
    @param {Object|number} changes The changes that occured to this widget
      or the number of the row whose change we're updating (in recursive mode).
    @fires duil#render
    @returns {duil.Group} Returns the group for chaining.
    @description
    * If there are no changes, there's nothing to render.
    *
    * Changes are merged into any pending changes and are added to a queue.
    * If the number of changes is small, all changes are processed before
    * returning. Otherwise, if enabled, rendering takes place over time.
    */
  render(changes) {
    const ns = this[hidden];
    const config = this.config;

    if ('number' === typeof changes) { // handle single change (base case)
      const index = changes;
      const change = ns.diff[index];
      ns.diff[index] = undefined; // prevent double-duty

      if (!change) { return this; }
      if (diff.isCreate(change)) { // create
        const model = this.data[index];
        this.create(model, index);
      } else if (diff.isRemove(change)) { // remove
        const model = change[0]; // model info is only in the change
        const view = this.key(model, index);
        this.remove(view, index);
      } else if (diff.isUpdate(change)) { // update
        const model = this.data[index];
        const view = this.key(model, index);
        this.update(view, model, index);
      } else {
        throw new Error(`unknown diff type: ${change}`);
      }// end if: performed change

      return this;
    }// end if: processed a single change

    if (!changes) { return this; }

    const delta = {};
    Object.entries(changes).forEach(([key, val]) => {
      const path = key.split('.');
      const idx = path[1];
      if ('data' === path[0] && path.length >= 2 && !delta[idx]) {
        delta[idx] = path.length > 2 ? ['dummy', this.data[idx]] : val;
      }// end if: stored data for create, remove, or update (dummy value)
    });

    ns.diff = merge(ns.diff, delta) || {};
    const q = ns.queue.set(Object.keys(ns.diff)
      .map(v => parseInt(v, 10))
      .sort((a, b) => a > b));
    if (config.asyncRender && q.length > config.largeChange) { // async
      if (config.showWarning && 0 === ns.drain_count) {
        // eslint-disable-next-line no-console
        console.log('WARNING: async render');
      }// end if: show warning for new drain-cycles
      ns.drain_count += 1;
      this.drain();
    } else { // sync
      while (!q.isEmpty()) { this.render(q.get()); }
      // all steps processed, cleanup
      this.views = this.views.filter(view => view !== undefined);
      this.trigger('render');
    }// end if: render enqueued or completed

    return this;
  }

  /**
    @summary Remove an item from the queue and schedule future drain calls.
    @fires duil#render
    @returns {duil.Group} Return the group for chaining.
    */
  drain() {
    const ns = this[hidden];
    const q = ns.queue;
    ns.drain_count -= 1;
    if (q.isEmpty()) { return this; }// end if: nothing to do

    this.render(q.get());
    if (q.isEmpty()) { // that was last step, cleanup
      this.views = this.views.filter(view => view !== undefined);
      this.trigger('render')
    } else { // schedule future steps
      for (let i = 0; i < this.config.drainGrowth; i += 1) {
        ns.drain_count += 1;
        this.config.drainMethod(this.drain, 0);
      }
    }// end if: done or scheduled more
    return this;
  }
}

export default Group;
