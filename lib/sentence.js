const _ = require('lodash');
const Plugin = require('./plugin.js');
const contractions = require('./../data/contractions.js');
const partsOfSpeech = require('./../data/partsOfSpeech.js');

class Sentence extends Plugin {
  constructor(string) {
    super(string);
    this.normalize();
    this.tokenize();
    this.tag();
  }

  setGender(gender) {
    this.gender = (_.isString(gender) && gender.match(/(male|female|or|slash)/) ? gender : null);
    if(this.meta.person == 3 && this.meta.count == 1) {
      this.toSingular();
    }
    return this;
  }

  normalize() {
    this.normalized = this.input
      .replace(/([,;:?.])( |$)/g, ' $1 ')
      .replace(/((?!^)(\b[A-Z].+?( |\b))+)/g, '>$1>')
      .replace(/>(.*?) >/g, '>$1> ');
    _.each(contractions, v => {
      this.normalized = this.normalized.replace(v[0], v[1]);
    });
    return this;
  }

  tokenize() {
    this.tokenized = [].concat.apply([], this.normalized.split('>').map(function(v,i){
      return i%2 ? v : v.split(' ')
    })).filter(Boolean);
    return this;
  }

  nGrams(count) {
    let nGrams = [];
    let tags = this.tagged;
    _.each(tags, (v,k) => {
      let nGram = _.slice(tags, k, k + count);
      if(nGram.length == count) {
        nGrams.push(nGram);
      }
    });
    return nGrams;
  }

  tag() {
    this.tagged = this.tokenized.map((item, k) => {
      let currentTag = {
        word: item,
        index: k
      };
      if(partsOfSpeech.lexicon[item.toLowerCase()]) {
        _.set(currentTag, 'tags.all', partsOfSpeech.lexicon[item.toLowerCase()]);
        if(currentTag.tags.all.length == 1) {
          _.set(currentTag, 'tags.current', currentTag.tags.all[0]);
          _.set(currentTag, 'meta.pos', partsOfSpeech.tags[currentTag.tags.current]);
        }
      } else {
        _.set(currentTag, 'tags.all', partsOfSpeech.fallback(item));
        if(currentTag.tags.all.length == 1) {
          _.set(currentTag, 'tags.current', currentTag.tags.all[0]);
          _.set(currentTag, 'meta.pos', partsOfSpeech.tags[currentTag.tags.current]);
        }
      }
      return _.defaultsDeep(currentTag, {
        tags: {
          all: [],
          current: null
        },
        meta: {
          reason: null
        }
      });
    });
    _.each([5,4,3,2], (nGramCount) => {
      _.each(this.nGrams(nGramCount), nGrams => {
        let patterns = partsOfSpeech.patterns[nGramCount];
        _.each(patterns, (pattern) => {
          let match = 0;
          let pos = {};
          _.each(pattern, (regex, k) => {
            if(_.find(nGrams[k].tags.all, (item) => {
              pos[nGrams[k].index] = item;
              return item.match(regex);
            })) {
              match++;
            }
          });
          if(match == nGramCount) {
            _.each(pos, (v,k) => {
              if(!this.tagged[k].tags.current || this.tagged[k].meta.reason !== 'pattern') {
                this.tagged[k].tags.current = v;
                this.tagged[k].meta.pos = partsOfSpeech.tags[v];
                this.tagged[k].meta.reason = 'pattern';
                this.tagged[k].meta.pattern = pos;
              }
            });
          }
        });
      });
    });
    this.tagged = this.tagged.map(item => {
      if(!item.tags.current && item.tags.all.length) {
        item.tags.current = item.tags.all[0];
        item.meta.pos = partsOfSpeech.tags[item.tags.current];
        item.meta.reason = 'default';
      }
      return item;
    });
    return this;
  }

  isQuestion() {
    return _.last(this.tokenized) === '?';
  }

  hasSubordinateClase() {
    if(this.getSubordinateClase()) {
      return true;
    }
    return false;
  }

  getSubordinateClase() {
    let conjunction = _.find(this.tagged, item => {
      return item.tags.current.match(/^C(S|C)/g);
    });
    if(!conjunction) {
      return null;
    }
    let comma = _.find(this.tagged, item => {
      return item.word.match(/[,;]/g);
    });
    let length = (comma ? comma.index : null);
    if(conjunction.index > 0) {
      return _.slice(this.tagged, conjunction.index);
    } else {
      return _.slice(this.tagged, 0, length);
    }
  }
}

module.exports.instance = (string) => {
  return new Sentence(string);
};
module.exports.model = Sentence;
