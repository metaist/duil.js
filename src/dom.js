import * as _ from './lodash';

/**
  A collection of functions for controlling DOM nodes.
  @namespace dom
  @memberof duil
  */

/**
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
  @memberof duil.dom
  @summary Set the text of an element.
  @param {Element|jQuery} element The element to append.
  @param {string} string The string to set.
  @return {string|jQuery} The string that was set (jQuery: the element).
  */
function setText(element, string) {
  return _.isElement(element) ?
    (element.textContent = string) :
    element.text(string);
}


export { find, findAll, remove, clone, append, setText }
export default {
  find: find,
  findAll: findAll,
  remove: remove,
  clone: clone,
  append: append,
  setText: setText
}
