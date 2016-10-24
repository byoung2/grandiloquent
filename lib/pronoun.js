const _ = require('lodash');
const Plugin = require('./plugin.js');
const pronouns = require('./../data/pronouns.js');

class Pronoun extends Plugin {
  constructor(string) {
    super(string);
    let matchedPronoun = _.find(pronouns, item => {
      let testPronoun = string
        .toLowerCase()
        .trim()
        .split(' ')
        .shift();
      return testPronoun === item.pronoun;
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
    }
    this.gender = (this.meta ? this.meta.gender : 'slash');
  }

  setGender(gender) {
    this.gender = (_.isString(gender) && gender.match(/(male|female|or|slash)/) ? gender : null);
    if(this.meta.person == 3 && this.meta.count == 1) {
      this.toSingular();
    }
    return this;
  }

  toBase() {
    this.current = this.input
      .toLowerCase()
      .trim()
      .split(' ')
      .shift();
    return this;
  }

  toPlural() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === search.person
        && item.count === 2) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }

  toSingular() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === search.person
        && item.count === 1
        && (_.isNull(this.gender) || item.gender === this.gender)) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }
}

module.exports.instance = (string) => {
  return new Pronoun(string);
};
module.exports.model = Pronoun;
