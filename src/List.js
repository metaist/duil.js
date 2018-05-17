import * as DOM from './dom';
import * as _ from './lodash';
import Group from './Group';

/**
  @classdesc A list is data connected to Elements using a template.
  @summary Data connected to Elements using a template.
  @description
  * A list is a kind of {@link duil.Group} that connects data to Elements
  * similar to an HTML template, except it doesn't require a special syntax.
  *
  * You may use raw DOM nodes or jQuery-like objects interchangeably with this
  * class.

  @memberof duil
  @constructor
  @extends duil.Group

  @property {Element|jQuery} $dom The container for rendered elements.
  @property {Element|jQuery} $tmpl The template for a single item.
  @property {string} [selector="li"] The query selector for rendered items.

  @param {Object} props The initial properties of the widget.
  @example
  * var myList = duil.List({
  *   $dom: $('<ul id="my-list"><li></li></ul>'),
  *   selector: 'li'
  * });
  *
  * myList.set({data: [1, 2, 3]});
  * // => <ul id="my-list"><li>1</li><li>2</li><li>3</li></ul>
  */
class List extends Group {
  constructor(props) {
    super(Object.assign({
      $dom: null,
      $tmpl: null,
      selector: 'li'
    }, props));
  }

  /**
    @summary Initialize the list.
    @description
    * By default, if the `this.$tmpl` is not defined, it is extracted from
    * the container by querying for the first element that matches `selector`.

    @returns {duil.List} The widget itself for chaining.
  */
  init() {
    if (this.$dom && this.selector) {
      if (!this.$tmpl) {
        this.$tmpl = DOM.remove(DOM.find(this.$dom, this.selector));
      }// end if: extracted template from container
      this.views = DOM.findAll(this.$dom, this.selector);
    }// end if: initialized views
    return this;
  }

  /**
    @summary Get the view that corresponds to the given model.
    @description
    * For `duil.List`, the views may either be a jQuery object or a plain array.

    @override
    @param {*} model The model whose view we want.
    @param {number} index The index of the model.
    @returns {Element|jQuery} Returns the view or `null` if none is found.
    */
  key(model, index) {
    return index < this.views.length ? DOM.getIndex(this.views, index) : null;
  }

  /**
    @summary Create and add new DOM object.
    @description
    * By default, clones the template, updates it using [.udpate()](#update),
    * and then appends it to the container.

    @param {*} model The data for this element.
    @param {Number} index The model index.
    @returns {Element|jQuery} Returns the new element.
    */
  create(model, index) {
    const view = this.update(DOM.clone(this.$tmpl), model, index);
    DOM.append(this.$dom, view);
    DOM.insert(this.views, index, view);
    return view;
  }

  /**
    @summary Update a DOM object.
    @description
    * By default, sets the text of the element to the model.

    @param {Element|jQuery} view The element to update.
    @param {*} model The data for this element.
    @param {Number} index The model index.
    @returns {Element|jQuery} Returns the element.
    */
  // eslint-disable-next-line class-methods-use-this
  update(view, model, index) {
    DOM.setText(view, model);
    return view;
  }

  /**
    @summary Remove a DOM object.

    @param {Element[]|jQuery} views The DOM objects to remove.
    @returns {duil.List} The widget itself for chaining.
    */
  remove(views) {
    this.invoke(Group, 'remove', views);
    _.forEach(views, DOM.remove);
    return this;
  }

  /**
    @summary Render the widget when data changes.
    @description
    * This method uses the `.key()` method to map the item data to the DOM.
    * DOM objects that aren't found are created; those that are found are
    * updated. Items that exist and were selected, but not updated, are removed.

    @returns {duil.List} The widget itself for chaining.
    */
  render() {
    const views = _.map(this.data, (model, index) => {
      const view = this.key(model, index);
      return DOM.getElement(view ?
        this.update(view, model, index) :
        this.create(model, index));
    });

    const untouched = _.differenceWith(this.views, views, _.isEqual);
    this.remove(untouched);
    return this;
  }
}

export default List;
