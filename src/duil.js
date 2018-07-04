/**
  duil = data + ui + loop
  @namespace duil
 */

/**
  @constant
  @memberof duil
  @name version
  @summary [Semantic Version](http://semver.org) of duil.
*/
export {version} from '../package.json';

// Core
export {default as Widget} from './Widget';
export {default as Group} from './Group';
export {default as List} from './List';

// Utilities
export {default as Queue} from './Queue';
export {diff, merge} from './diff';

// Plugins
import './jquery.duil';
