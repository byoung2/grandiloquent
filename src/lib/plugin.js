const _ = require('lodash');

class Plugin {
  constructor(string) {
    this.input = string;
    this.current = string;
  }

  toString() {
  	return this.current;
  }

  clone() {
    return _.clone(this);
  }

  tap(fn) {
    fn.call(null, this);
    return this;
  }
}

module.exports = Plugin
