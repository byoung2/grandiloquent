/**
 * @license
 * grandiloquent <https://grandiloquentjs.com/>
 * Copyright grandiloquent team and other contributors
 * Released under MIT license <https://grandiloquent.com/license>
 * Copyright Bryan Young
 */

;(function (global, factory) {
  if(typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if(typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.moment = factory()
  }
}(this, function () { 'use strict';
  return {
    verb: require('./lib/verb.js').instance,
    pronoun: require('./lib/pronoun.js').instance,
    noun: require('./lib/noun.js').instance,
    sentence: require('./lib/sentence.js').instance
  };
}));
