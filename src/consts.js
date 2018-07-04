/**
  @private
  @const {Function}
  @summary The top-most namespace such as `global` or `window` in a browser.
  @see {@link https://github.com/lodash/lodash/blob/master/.internal/root.js}
*/
// eslint-disable-next-line no-new-func
export const globalTop = Function('return this')();

/**
  @private
  @const {Symbol}
  @summary Symbol for a private namespace inside an object.
  */
export const hidden = Symbol('hidden');

/**
  @private
  @const {undefined}
  @summary Shorter constant for `undefined`.
  */
export const undef = undefined;
