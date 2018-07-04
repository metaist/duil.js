import * as _ from './lodash';

/**
  @private
  @memberof duil
  @namespace _dom
  @summary Namespace for controlling DOM nodes.
  @description Namespace for controlling DOM nodes.
  */

/* eslint func-style: ["error", "declaration"] */

/**
  @private
  @memberof duil._dom
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
  @memberof duil._dom
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
  @memberof duil._dom
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
  @memberof duil._dom
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
  @memberof duil._dom
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

export {find, clone, append, remove, setText}

export default {
  find: find,
  clone: clone,
  append: append,
  remove: remove,
  setText: setText
}
