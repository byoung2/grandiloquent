const _ = require('lodash');
const Plugin = require('./plugin.js');

class Noun extends Plugin {
  constructor(string) {
    super(string);
  }

  toPlural() {
    this.current = this.current.concat('s');
    return this;
  }

  toSingular() {

    return this;
  }
}

module.exports.instance = (string) => {
  return new Noun(string);
};
module.exports.model = Noun;
