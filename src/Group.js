import * as _ from './lodash';
import Widget from './Widget';

/**
  @classdesc A group is a collection of models connected to views.
  @summary Collection of models connected to views.
  @description
  * A group widget represents multiple objects backed by the same array of data.
  * It's purpose is to maintain the lifecycle of creating, updating, and
  * removing view-related objects in response to changes in the underlying data.
  *
  * For example, suppose you're drawing dots on a canvas. The attributes of each
  * dot are stored in `data` while the objects actually manipulate are in
  * `views`.

  @memberof duil
  @constructor
  @extends duil.Widget

  @property {Array} data The data models for this group.
  @property {Object[]} views The objects that represent the models.

  @param {Object} props Initial properties of the widget.
*/
class Group extends Widget {
  constructor(props) {
    Object.assign(Group.prototype, {
      data: [],
      views: []
    });
    super(props);
  }

  /**
    @summary Gets the view at the same index as the model.

    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Object|null} Returns the view or `null` if none is found.
   */
  static KEY_BY_INDEX(model, index) {
    return index < this.views.length ? this.views[index] : null;
  }

  /**
    Gets the view with the same id as the model.

    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Object|null} Returns the view or `null` if none is found.
   */
  static KEY_BY_ID(model, index) {
    return _.find(this.views, {id: model.id});
  }

  /**
    @summary Get the view that corresponds to the given model.
    @description
    * This method is called during {@link Group.duil.render} to determine which
    * view should be updated.
    *
    * If this method returns `null`, a new view will be created.
    *
    * By default, {@link duil.Group.KEY_BY_INDEX} method is used which assumes
    * that both models and views are in the same order. Alternatively, if they
    * are in different orders, but have an `id` property in common, you can used
    * {@link duil.Group.KEY_BY_ID}.
    *
    * In general, you should not have to override this method unless your models
    * are not in a guaranteed order and it is cheaper to map from models to
    * views in some other way.

    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Object} Returns the view or `null` if none is found.
    */
  // eslint-disable-next-line class-methods-use-this
  key(model, index) { return null; }

  /**
    @summary Create a new view for a given model.

    @param {*} model The model that needs a new view.
    @param {number} index The index of the model.
    @returns {Object} Returns the newly-created view.
   */
  create(model, index) {
    var view = this.update({}, model, index);
    this.views.splice(index, 0, view);
    return view;
  }

  /**
    @summary Update a view to match its model.

    @param {Object} view The view to update.
    @param {*} model The model for the view.
    @param {number} index The index of the model.
    @returns {Object} Returns the now-updated view.
   */
  // eslint-disable-next-line class-methods-use-this
  update(view, model, index) { return Object.assign(view, model); }

  /**
    @summary Remove the views that are no longer backed by a model.
    @description
    * This function is similar to the d3 concept of
    * [exit()](https://github.com/d3/d3-selection/blob/master/README.md#selection_exit).
    * These are the views that no longer have data associated with them and
    * should be removed.
    * The defualt behavior is to simply remove them from the array of views.
    *
    * You should override this method to perform the appropriate clean up action
    * that disposes of the view.

    @param {Object[]} views The views to remove.
    @returns {duil.Group} Returns the group for chaining.
   */
  remove(views) {
    _.pullAll(this.views, views);
    return this;
  }

  /**
    @summary Update the mapping between models and views.
    @description
    * First, we get each model's view by using {@link duil.Group#key}. If it
    * returns `null` (i.e. there is no corresponding view), a new view will be
    * [created](#create). If a view exists, it will be [updated](#update).
    * Any existing views that do not have a corresponding model will be
    * [removed](#remove).

    @returns {duil.Group} Returns the group for chaining.
   */
  render() {
    var views = _.map(this.data, (model, index) => {
      var view = this.key(model, index);
      return view ?
        this.update(view, model, index) :
        this.create(model, index);
    });

    var untouched = _.differenceWith(this.views, views, _.isEqual);
    this.remove(untouched);
    return this;
  }
}

// By default, use the KEY_BY_INDEX static method.
Group.prototype.key = Group.KEY_BY_INDEX;

export default Group;
