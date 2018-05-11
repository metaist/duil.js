/**
  Data + UI + Loop = duil
  @namespace duil
 */

/**
  @summary [Semantic Version](http://semver.org) of duil.
  @constant
  @memberof duil
  @name VERSION
*/
export {version} from '../package.json';

export {default as Widget} from './Widget';
export {default as Group} from './Group';
export {default as List} from './List';
export {default as dom} from './dom';

import './jquery.duil';
