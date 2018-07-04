import * as DOM from './dom';
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
    @override
    @summary Initialize the list.
    @returns {duil.List} The widget itself for chaining.
    @description
    * By default, if the `this.$tmpl` is not defined, it is extracted from
    * the container by querying for the first element that matches `selector`.
    */
  init() {
    if (this.$dom && this.selector && !this.$tmpl) {
      this.$tmpl = DOM.remove(DOM.find(this.$dom, this.selector));
    }// end if: extracted template
    return this.invoke(Group, 'init');
  }

  /**
    @summary Create and add new DOM object.
    @description
    * By default, clones the template, updates it using [.update()](#update),
    * and then appends it to the container.

    @override
    @param {*} model The data for this element.
    @param {Number} index The model index.
    @returns {Element|jQuery} Returns the new element.
    */
  create(model, index) {
    const view = this.update(DOM.clone(this.$tmpl), model, index);
    DOM.append(this.$dom, view);
    this.views[index] = view;
    this.trigger('create', {view: view, model: model, index: index});
    return view;
  }

  /**
    @summary Update a DOM object.
    @description
    * By default, sets the text of the element to the model.

    @override
    @param {Element|jQuery} view The element to update.
    @param {*} model The data for this element.
    @param {Number} index The model index.
    @returns {Element|jQuery} Returns the element.
    */
  update(view, model, index) {
    DOM.setText(view, model);
    this.trigger('update', {view: view, model: model, index: index});
    return view;
  }

  /**
    @summary Remove a DOM object.

    @override
    @param {Element[]|jQuery} view The DOM objects to remove.
    @param {Number} index The previous index of the view.
    @returns {duil.List} The widget itself for chaining.
    */
  remove(view, index) {
    DOM.remove(view);
    return this.invoke(Group, 'remove', view, index);
  }
}

export default List;
