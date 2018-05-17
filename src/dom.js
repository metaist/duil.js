import * as _ from './lodash';

/* eslint func-style: ["error", "declaration"] */

/**
  @private
  @memberof duil.dom
  @summary Find the first element within another element using a CSS query.
  @param {Element|jQuery} element The element within which to search.
  @param {string} query The CSS query.
  @return {Element|null|jQuery} The result of the query.
  */
function find(element, query) {
  return _.isElement(element) ?
    element.querySelector(query) :
    element.find(query).eq(0);
}

/**
  @private
  @memberof duil.dom
  @summary Find all the elements within another element using a CSS query.
  @param {Element|jQuery} element The element within which to search.
  @param {string} query The CSS query.
  @return {Element[]|jQuery} The results of the query.
  */
function findAll(element, query) {
  return _.isElement(element) ?
    Array.from(element.querySelectorAll(query)) :
    element.find(query);
}

/**
  @private
  @memberof duil.dom
  @summary Remove an element from the DOM.
  @param {Element|jQuery} element The element to remove.
  @return {Element|jQuery} The element that was removed.
  */
function remove(element) {
  if (!element) { return null; }
  return _.isElement(element) ?
    element.parentElement.removeChild(element) :
    element.remove();
}

/**
  @private
  @memberof duil.dom
  @summary Clone an element.
  @param {Element|jQuery} element The element to clone.
  @return {Element|jQuery} The cloned element.
  */
function clone(element) {
  return _.isElement(element) ?
    element.cloneNode(true) :
    element.clone();
}

/**
  @private
  @memberof duil.dom
  @summary Append an element to a parent.
  @param {Element|jQuery} parent The element to append into.
  @param {Element|jQuery} element The element to append.
  @return {Element|jQuery} The element that was appended (jQuery: the parent).
  */
function append(parent, element) {
  return _.isElement(element) ?
    parent.appendChild(element) :
    parent.append(element);
}

/**
  @private
  @memberof duil.dom
  @summary Set the text of an element.
  @param {Element|jQuery} element The element to append.
  @param {string} string The string to set.
  @return {Element|jQuery} The element that was affected.
  */
function setText(element, string) {
  if (_.isElement(element)) {
    element.textContent = string;
  } else {
    element.text(string);
  }// end if: text content set
  return element;
}

/**
  @private
  @memberof duil.dom
  @summary Unwrap an element.
  @param {Element|jQuery} element The element to unwrap.
  @return {Element} The element itself.
  */
function getElement(element) {
  return _.isElement(element) ? element : element.get(0);
}

/**
  @private
  @memberof duil.dom
  @summary Get the element at the given index.
  @param {Element[]|jQuery} array Set of elements.
  @param {number} index The index of the element to get.
  @return {Element|jQuery} The element at the index.
  */
function getIndex(array, index) {
  return _.isArray(array) ? array[index] : array.eq(index);
}

/**
  @private
  @memberof duil.dom
  @summary Insert element at the given index.
  @param {Element[]|jQuery} array Set of elements.
  @param {number} index The index at which to insert.
  @param {Element|jQuery} element The element to insert.
  @return {Element[]|jQuery} The modified array of elements.
  */
function insert(array, index, element) {
  array.splice(index, 0, getElement(element));
  return array;
}

export {find, findAll, remove, clone, append, setText,
        getElement, getIndex, insert}

/**
  A collection of functions for controlling DOM nodes.
  @namespace _dom
  @private
  @memberof duil
  */
export default {
  find: find,
  findAll: findAll,
  remove: remove,
  clone: clone,
  append: append,
  setText: setText,
  getElement: getElement,
  getIndex: getIndex,
  insert: insert
}
