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
    Object.assign(List.prototype, {
      $dom: null,
      $tmpl: null,
      selector: 'li'
    });
    super(props);
  }

  /**
    @summary Initialize the list.
    @description
    * By default, if the `this.$tmpl` is not defined, it is extracted from
    * the container by querying for the first element that matches `selector`.

    @returns {duil.List} The widget itself for chaining.
  */
  init() {
    if (this.$dom && !this.$tmpl) {
      this.$tmpl = DOM.remove(DOM.find(this.$dom, this.selector));
    }// end if: extracted template from container
    return this;
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
    var view = this.update(DOM.clone(this.$tmpl), model, index);
    DOM.append(this.$dom, view);
    this.views.splice(index, 0, view);
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

    @param {jQuery} views The DOM objects to remove.
    @returns {duil.List} The widget itself for chaining.
    */
  remove(views) {
    _.forEach(views, DOM.remove);
    return this;
  }

  /**
    @summary Render the widget when data changes.
    @description
    * By default, reselect the DOM items and stitch `this.data` to them.
    *
    * This method uses the `.key()` method to map the item data to the DOM.
    * DOM objects that aren't found are created; those that are found are
    * updated. Items that exist and were selected, but not updated, are removed.

    @returns {duil.List} The widget itself for chaining.
    */
  render() {
    if (this.$dom) {
      this.views = DOM.findAll(this.$dom, this.selector);
    }// end if: refresh the list of views if they changed outside our context.

    super.render();
    return this;
  }
}

export default List;
