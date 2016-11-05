const _ = require('lodash');
const Plugin = require('./plugin.js');

class Noun extends Plugin {
  constructor(string) {
    super(string);
  }

  toPlural() {
    if(this.current.match(/([A-Z].*ese|fish|ois|sheep|deer|pox|itis|media|measles)$/)) {

    } else if(this.current.match(/man$/)) {
      this.current = this.current.replace(/man$/, 'men');
    } else if(this.current.match(/[lm]ouse$/)) {
      this.current = this.current.replace(/ouse$/, 'ice');
    } else if(this.current.match(/tooth$/)) {
      this.current = this.current.replace(/tooth$/, 'teeth');
    } else if(this.current.match(/goose$/)) {
      this.current = this.current.replace(/goose$/, 'geese');
    } else if(this.current.match(/foot$/)) {
      this.current = this.current.replace(/foot$/, 'feet');
    } else if(this.current.match(/[csx]is$/)) {
      this.current = this.current.replace(/is$/, 'es');
    } else if(this.current.match(/(matr|vert|ind)(ix|ex)$/)) {
      this.current = this.current.replace(/x$/, 'ces');
    } else if(this.current.match(/(x|ch|ss|sh)$/)) {
      this.current = this.current.concat('xes');
    } else if(this.current.match(/[aeiou]y$/)) {
      this.current = this.current.concat('s');
    } else if(this.current.match(/y$/)) {
      this.current = this.current.replace(/y$/, 'ies');
    } else if(this.current.match(/(buffal|tomat|potat|ech|her|vet)o$/)) {
      this.current = this.current.concat('es');
    } else {
      this.current = this.current.concat('s');
    }
    return this;
  }

  toSingular() {
    if(this.current.match(/([A-Z].*ese|fish|ois|sheep|deer|pox|itis|media|measles)$/)) {

    } else if(this.current.match(/men$/)) {
      this.current = this.current.replace(/men$/, 'man');
    } else if(this.current.match(/[lm]ice$/)) {
      this.current = this.current.replace(/ice$/, 'ouse');
    } else if(this.current.match(/teeth$/)) {
      this.current = this.current.replace(/teeth$/, 'tooth');
    } else if(this.current.match(/geese$/)) {
      this.current = this.current.replace(/geese$/, 'goose');
    } else if(this.current.match(/feet$/)) {
      this.current = this.current.replace(/feet$/, 'foot');
    } else if(this.current.match(/(vert|ind)(ices)$/)) {
      this.current = this.current.replace(/ices$/, 'ex');
    } else if(this.current.match(/(matr)(ices)$/)) {
      this.current = this.current.replace(/ices$/, 'ix');
    } else if(this.current.match(/[csx]es$/)) {
      this.current = this.current.replace(/es$/, 'is');
    } else if(this.current.match(/(x|ch|ss|sh)es$/)) {
      this.current = this.current.replace(/es$/, '');
    } else if(this.current.match(/ys$/)) {
      this.current = this.current.replace(/ys$/, 'y');
    } else if(this.current.match(/(fl|sp|r|n)ies$/)) {
      this.current = this.current.replace(/ies$/, 'y');
    } else if(this.current.match(/(buffal|tomat|potat|ech|her|vet)oes$/)) {
      this.current = this.current.replace(/es$/, '');
    } else {
      this.current = this.current.replace(/s$/, '');
    }
    return this;
  }
}

module.exports.instance = (string) => {
  return new Noun(string);
};
module.exports.model = Noun;
