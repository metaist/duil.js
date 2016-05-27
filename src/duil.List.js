define([
  'jquery',
  'lodash',
  './duil.core'
], function ($, _, duil) {
  'use strict'; // build ignore:line

  /*
    Construct a data-driven list widget.

    The list widget helps represent changes in list of objects. By convention,
    it uses certain properties and methods to help manage the list.

    @extends duil.Widget
    @param {Object} props The initial properties of the widget.
    @property {jQuery} $dom The container for the list.
    @property {jQuery} $tmpl The template for a single item.
    @property {String} selector The selector for the list items.
    @property {Array} data The list data.
    @example

    $('body').append('<ul id="my-list"><li></li></ul>');

    var MyList = new duil.List({
      $dom: $('#my-list'),

      //@override
      init: function () {
        this.$tmpl = this.$dom.find('li').remove();
        return this;
      }
    });

    MyList.set({data: [1, 2, 3]});
    // => <ul id="my-list"><li>1</li><li>2</li><li>3</li></ul>
  */
  duil.List = duil.Widget.subclass({
    $dom: $(),
    $tmpl: $('li'),
    selector: 'li',
    data: [],
  });

  /**
    Initialize the list.

    By default, the template is a detached DOM node using `this.items()`.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.init = function () {
    this.$tmpl = this.items().remove();
    return this;
  };

  /**
    Return the DOM objects that can be updated.

    By default, this function finds `this.selector` within `this.$dom`.

    @returns {jQuery} Returns the DOM objects that can be selected.
  */
  duil.List.prototype.items = function () {
    return this.$dom.find(this.selector);
  };

  /**
    Return the DOM object to update.

    By default, return the nth DOM object in the list items.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @returns {jQuery} Returns the DOM object to update.
  */
  duil.List.prototype.key = function (data, index) {
    return this.items().eq(index);
  };

  /**
    Add a DOM object.

    By default, clones `this.$tmpl`, updates it using `this.udpate()`, and then
    appends it to `this.$dom`.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.add = function (data, index) {
    var $item = this.$tmpl.clone();
    this.update(data, index, $item);
    this.$dom.append($item);
    return this;
  };

  /**
    Update a DOM object.

    By default, sets the text of the item to the item data.

    @param {*} data The item data.
    @param {Number} index The 0-based number of this object.
    @param {jQuery} $item The DOM object to update.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.update = function (data, index, $item) {
    $item.text(data);
    return this;
  };

  /**
    Remove a DOM object.

    By default, removes the DOM object using jQuery.

    @param {jQuery} $items The DOM objects to remove.
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.remove = function ($items) {
    $items.remove();
    return this;
  };

  /**
    Render the widget when data changes.

    By default, reselect the DOM items and stitch `this.data` to them.

    This method uses the `.key()` method to map the item data to the DOM.
    DOM objects that aren't found are created; those that are found are updated.
    Items that exist and were selected, but not updated, are removed.

    @override
    @returns {duil.List} Returns the widget itself for chaining.
  */
  duil.List.prototype.render = function () {
    var $items = this.items();
    var touched = [];
    _.forEach(this.data, _.bind(function (data, index) {
      var $item = this.key(data, index);
      if (!$item.length) { // add
        this.add(data, index);
      } else { // update
        this.update(data, index, $item);
        touched.push($item.get()[0]);
      }//end if: add or update item
    }, this));

    this.remove($items.not(touched)); // untouched removed
    return this;
  };

  return duil.List; // build ignore:line
});
