import * as _ from './lodash';
import {undef} from './consts';

/**
  @private
  @memberof duil
  @namespace _diff
  @summary Namespace for managing diffs.
  @description  Namespace for managing diffs.
  */


/**
  @private
  @memberof duil._diff
  @constant
  @summary The delimeter for paths.
  */
const PATH_DELIMETER = '.';

/**
  @private
  @memberof duil._diff
  @summary Return true if the given value is not an object or array.
  @param {*} val The value to check.
  @return {boolean} True if the value is not an object or array.
  */
const isValue = val => !_.isObject(val) ||
  _.isBoolean(val) ||
  _.isNumber(val) ||
  _.isDate(val) ||
  _.isElement(val) ||
  _.isRegExp(val) ||
  _.isString(val);


/**
  @memberof duil
  @summary Return the difference between two objects or arrays.
  @param {Object|Array} first The first item to compare.
  @param {Object|Array} second The second item to compare.
  @param {string} [prefix] Optional prefix for the current key.
  @return {Object|null} Differences between the two objects, or null if none.
  @description
  * The diff format returned by this function (aka "normal" deltas):
  * - `{prop: [undefined, value]}` - `prop` was created and set to `value`
  * - `{prop: [value, undefined]}` - `prop` was removed; last value was `value`
  * - `{prop: [value, value2]}` - `prop` was changed from `value` to `value2`
  *
  * Other unusual, but legal, values (aka "weird" deltas):
  * - `null` - no difference between the objects
  * - `{prop: [undefined, undefined]}` - `prop`'s creation was cancelled
  * - `{prop: undefined}` - `prop`'s change has been effected
  *    (cheaper way of deleting keys from a diff)
  */
const diff = (first, second, prefix) => {
  const result = {};
  const checked = {};
  const seen = new WeakMap();

  /**
    @private
    @summary Compute the difference between two objects at the same level.
    @param {*} obj1 The first item to compare.
    @param {*} obj2 The second item to compare.
    @param {string} prev The previous key information.
    @return {Object|null} Differences between the two objects, or null if none.
  */
  const step = (obj1, obj2, prev) => {
    if (obj1 === obj2) { return null; } // dumb test first
    if (isValue(obj1) || isValue(obj2)) {
      return _.isEqual(obj1, obj2) ? null : [obj1, obj2];
    }// end if: handled base case

    Object.entries(obj1).forEach(([key, val]) => {
      const newKey = prev ? `${prev}.${key}` : key;
      if (_.isObject(val)) {
        if (newKey.startsWith(seen.get(val))) { return; }
        seen.set(val, newKey);
      }// end if: check for circularity

      checked[newKey] = true;
      const delta = step(val, obj2[key], newKey);
      if (delta) { result[newKey] = delta; }
    }); // checked all keys in first

    Object.entries(obj2).forEach(([key, val]) => {
      const newKey = prev ? `${prev}${PATH_DELIMETER}${key}` : key;
      if (_.isObject(val)) {
        if (newKey.startsWith(seen.get(val))) { return; }
        seen.set(val, newKey);
      }// end if: check for circularity

      if (checked[newKey]) { return; }
      checked[newKey] = true;
      const delta = step(undefined, val, newKey);
      if (delta) { result[newKey] = delta; }
    }); // checked all keys in second not in first

    return undefined;
  };

  const delta = step(first, second, prefix);
  if (delta) { return prefix ? {[prefix]: delta} : delta; }
  return Object.keys(result).length > 0 ? result : null;
};

/**
  @memberof duil.diff
  @summary Return true if the given value is a no-op in the diff format.
  @param {Array} val Value to check; `undefined` or a 2-element array.
  @return {boolean} True if the value is undefined or is a no-op.
  */
diff.isNop = val => _.isEmpty(val) || (undef === val[0] && undef === val[1]);

/**
  @memberof duil.diff
  @summary Return true if the given value is a create in the diff format.
  @param {Array} val Value to check; `undefined` or a 2-element array.
  @return {boolean} True if the value is undefined or is a create.
  */
diff.isCreate = val => val[0] === undef && val[1] !== undef;

/**
  @memberof duil.diff
  @summary Return true if the given value is a update in the diff format.
  @param {Array} val Value to check; `undefined` or a 2-element array.
  @return {boolean} True if the value is undefined or is a update.
  */
diff.isUpdate = val => val[0] !== undef && val[1] !== undef;

/**
  @memberof duil.diff
  @summary Return true if the given value is a remove in the diff format.
  @param {Array} val Value to check; `undefined` or a 2-element array.
  @return {boolean} True if the value is undefined or is a remove.
  */
diff.isRemove = val => val[0] !== undef && val[1] === undef;

/**
  @memberof duil
  @summary Return the diff that results from merging the two diffs.
  @param {Object} first The first diff to merge.
  @param {Object} second The second diff to merge.
  @return {Object|null} The resulting diff when the two are merged.
  @description
  * In theory, some merges are not valid:
  *   - `add + add` - adding something that's already there
  *   - `update + add` - updating something that doesn't exist
  *   - `remove + update` - updating something that's been removed
  *   - `remove + remove` - removing something that's been removed
  *
  * Nonetheless, for these situations, we infer what was meant by taking the
  * pre-state of the first delta and combining it with the post-state of the
  * second delta. We consider this sensible because the diffs do not need to
  * represent sequential states and could represent states at very different
  * times (e.g. jumping from one time to another in a timeline).
  *
  * Basic rules:
  * - `normal + normal = normal`
  * - `normal + weird = normal` (the weird is ignored)
  * - `weird + normal = normal` (again, the weird is ignored)
  * - `weird + weird = null` (two weirds make a null)
  *
  * In general, merging any two "normal" deltas together will result in a normal
  * delta. Merging any two "weird" deltas will result in `null`.
  */
const merge = (first, second) => {
  if (_.isEmpty(first) && _.isEmpty(second)) { return null; }

  const isNop = diff.isNop;
  const left = first || {};
  const right = second || {};
  const result = {};
  const checked = {};

  Object.entries(left).forEach(([key, val]) => {
    checked[key] = true;
    const val2 = right[key];
    const nop1 = isNop(val);
    const nop2 = isNop(val2);

    if (nop1 && nop2) { // weird + weird = null
      // do nothing
    } else if (nop1) { // weird + normal = normal
      result[key] = val2;
    } else if (nop2) { // normal + weird = normal
      result[key] = val;
    } else { // normal + normal = new normal
      const newval = [val[0], val2[1]];
      if (!isNop(newval)) { result[key] = newval; }
    } // end if: added any keys
  });

  Object.entries(right).forEach(([key, val]) => {
    if (!isNop(val) && !checked[key]) {
      result[key] = val;
    }// end if: added remaining non-weird values
  });

  return Object.keys(result).length > 0 ? result : null;
};

export {diff, merge}

export default {
  diff: diff,
  merge: merge
}
