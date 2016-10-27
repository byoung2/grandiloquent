const _ = require('lodash');
const Plugin = require('./plugin.js');
const contractions = require('./../data/contractions.js');
const partsOfSpeech = require('./../data/partsOfSpeech.js');
const Verb = require('./verb.js');
const Pronoun = require('./pronoun.js');

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

  hasSubordinateClause() {
    if(this.getSubordinateClause()) {
      return true;
    }
    return false;
  }

  getSubordinateClause() {
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

  getMainVerb() {
    let verbs = _(this.tagged)
      .differenceBy(this.getSubordinateClause(), 'index')
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^VB/g);
      })
      .value();
    if(!verbs.length) {
      return null;
    }
    return verbs.shift();
  }

  getSubject() {
    let verb = this.getMainVerb();
    let subjects = _(this.tagged)
      .differenceBy(this.getSubordinateClause(), 'index')
      .dropRightWhile((item) => {
        return item.index > verb.index;
      })
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^(P|N)/g);
      })
      .value();
    if(!subjects.length) {
      return null;
    }
    return subjects.shift();
  }

  getSubjectPhrase() {
    let verb = this.getMainVerb();
    let words = _(this.tagged)
      .differenceBy(this.getSubordinateClause(), 'index')
      .dropRightWhile((item) => {
        return item.index >= verb.index;
      })
      .dropRightWhile((item) => {
        return item.tags.current && item.tags.current.match(/^(RB|MD|VB)/g);
      })
      .dropWhile((item) => {
        return item.tags.current && !item.tags.current.match(/^(P|N|A|C|IN|TO|J)/g);
      })
      .value();
    if(!words.length) {
      return null;
    }
    return new Sentence(words
      .map(item => {
        return item.word;
      })
      .join(' '));
  }

  getSubjectVerbPhrase() {
    let verb = this.getMainVerb();
    let subject = this.getSubjectPhrase();
    if(!verb || !subject) {
      return new Sentence('');
    }
    let words = _(this.tagged)
      .dropRightWhile((item) => {
        return item.index > verb.index;
      })
      .dropWhile((item) => {
        return item.index < subject.index;
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words
      .map(item => {
        return item.word;
      })
      .join(' '));
  }
}

module.exports.instance = (string) => {
  return new Sentence(string);
};
module.exports.model = Sentence;
