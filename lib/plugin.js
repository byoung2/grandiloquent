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
}

module.exports = Plugin
