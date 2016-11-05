const _ = require('lodash');
const Plugin = require('./plugin.js');
const contractions = require('./../data/contractions.js');
const partsOfSpeech = require('./../data/partsOfSpeech.js');
const Verb = require('./verb.js');
const Pronoun = require('./pronoun.js');
const Noun = require('./noun.js');

class Sentence extends Plugin {
  constructor(string) {
    if(_.isArray(string)) {
      let joined = string
        .map(item => {
          return item.word;
        })
        .join(' ');
      super(joined);
      this.normalize();
      this.tokenize();
      this.tagged = string;
    } else {
      super(string);
      this.normalize();
      this.tokenize();
      this.tag();
    }
  }

  reset(string) {
    this.input = string;
    this.current = string;
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
      .replace(/([,;:?.]+)( |$)/g, ' $1 ')
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
      return item.tags.current && item.tags.current.match(/^(C(S|C)|IN)/g);
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
    return new Sentence(words);
  }

  getMainVerbPhrase() {
    let subject = this.getSubjectVerbPhrase();
    if(!subject) {
      return new Sentence('');
    }
    let words = _(subject.tagged)
      .dropWhile((item) => {
        return item.tags.current && !item.tags.current.match(/^(RB|MD|VB)/g);
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  prepend(string) {
    let input = this.input;
    if(!_.first(this.tagged).tags.current.match(/^NNP/) && !input.match(/^i/i)) {
      input = _.lowerFirst(input);
    }
    let sentence = _.upperFirst(string)
      .concat(' ')
      .concat(input)
      .replace(/ ([,;:.!?]+)/g, '$1');
    this.reset(sentence);
    return this;
  }

  append(string) {
    let punctuation = _(this.tagged)
      .takeRightWhile((item) => {
        return item.word.match(/[.!?]+/);
      })
      .value();
    let sentence = _(this.tagged)
      .differenceBy(punctuation, 'index')
      .map(item => item.word)
      .concat(string.split(/ /g))
      .concat(punctuation.map(item => item.word))
      .value()
      .join(' ')
      .replace(/ ([,;:.!?]+)/g, '$1');
    this.reset(sentence);
    return this;
  }

  insert(string, options) {
    let stringSentence = null;
    if(string instanceof Sentence) {
      stringSentence = string;
    } else {
      stringSentence = new Sentence(string);
    }

    if(_.isNumber(options)) {
      let sentence = _(this.tagged)
        .slice(0, options)
        .map(item => item.word)
        .concat(stringSentence.tagged.map(item => item.word))
        .concat(_.slice(this.tagged, options).map(item => item.word))
        .value()
        .join(' ')
        .replace(/ ([,;:.!?]+)/g, '$1');
      this.reset(sentence);
    } else if(_.isObject(options)) {
      let leftIndex = null;
      let rightIndex = null;
      _.each(options, (v,k) => {
        if(v.match(/^\$/)) {
          let method = 'get' + _.upperFirst(v.replace(/^\$/, ''));
          if(typeof this[method] === "function") {
            let tag = this[method].apply(this, []);
            if(_.isArray(tag)) {
              if(k == 'after') {
                leftIndex = rightIndex = _.first(tag).index + tag.length;
              } else if(k == 'before') {
                leftIndex = rightIndex = _.first(tag).index;
              } else if(k == 'replace') {
                leftIndex = _.first(tag).index;
                rightIndex = _.last(tag).index + tag.length -1;
              }
            } else if(tag instanceof Sentence) {
              if(k == 'after') {
                leftIndex = rightIndex = _.first(tag.tagged).index + tag.tagged.length -1;
              } else if(k == 'before') {
                leftIndex = rightIndex = _.first(tag.tagged).index;
              } else if(k == 'replace') {
                leftIndex = _.first(tag.tagged).index;
                rightIndex = _.last(tag.tagged).index + tag.tagged.length - 1;
              }
            } else {
              if(k == 'after') {
                leftIndex = rightIndex = tag.index + 1;
              } else if(k == 'before') {
                leftIndex = rightIndex = tag.index;
              } else if(k == 'replace') {
                leftIndex = tag.index;
                rightIndex = tag.index + 1;
              }
            }
          }
        }
      });
      let sentence = _(this.tagged)
        .slice(0, leftIndex)
        .map(item => item.word)
        .concat(stringSentence.tagged.map(item => item.word))
        .concat(_.slice(this.tagged, rightIndex).map(item => item.word))
        .value()
        .join(' ')
        .replace(/ ([,;:.!?]+)/g, '$1');
      this.reset(sentence);
    }
    return this;
  }

  replace(tag, string) {
    this.insert(string, {replace: tag})
    return this;
  }

  transform(tag, transform, params) {
    let string = null;
    if(tag.match(/^\$/)) {
      let method = 'get' + _.upperFirst(tag.replace(/^\$/, ''));
      if(typeof this[method] === "function") {
        let tag = this[method].apply(this, []);
        if(tag instanceof Sentence) {
          let verb = Verb.instance(tag.toString());
          verb[transform].apply(verb, params);
          string = verb.toString();
        } else if(tag.tags.current && tag.tags.current.match(/^VB/)) {
          let verb = Verb.instance(tag.word);
          if(typeof verb[transform] === "function") {
            verb[transform].apply(verb, params);
            string = verb.toString();
          }
        } else if(tag.tags.current && tag.tags.current.match(/^NN/)) {
          let noun = Noun.instance(tag.word);
          if(typeof noun[transform] === "function") {
            noun[transform].apply(noun, params);
            string = noun.toString();
          }
        }
      }
    }

    if(string) {
      this.replace(tag, string);
    }
    return this;
  }
}

module.exports.instance = (string) => {
  return new Sentence(string);
};
module.exports.model = Sentence;
