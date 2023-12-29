const _ = require('lodash');
const Plugin = require('./plugin.js');
const contractions = require('./../data/contractions.js');
const partsOfSpeech = require('./../data/partsOfSpeech.js');
const nameGenders = require('./../data/nameGenders.js');
const Verb = require('./verb.js');
const Noun = require('./noun.js');
const Word = require('./word.js');
const mathjs = require('mathjs');
const extractDate = require('extract-date').default;

class Sentence extends Plugin {
  constructor(string, lexicon = null) {
    if(lexicon) {
      _.forEach(lexicon, (v, k) => {
        if(partsOfSpeech.lexicon[k]) {
          partsOfSpeech.lexicon[k] = _.uniq(partsOfSpeech.lexicon[k].concat(v));
        } else {
          partsOfSpeech.lexicon[k] = _.uniq(v);
        }
      });
    }
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
    let nameRegExp = new RegExp(`((${ Object.keys(nameGenders).map(_.capitalize).join('|') })( |\b)([A-Z][a-zA-Z]+?( |\b))+)`, 'g');
    let uncommonNameRegExp = new RegExp(` ([A-Z][a-zA-Z]+?( |\b)([A-Z][a-zA-Z]+?( |\b))+)`, 'g');
    let phoneRegExp = new RegExp(`([+]?1? ?[(]?[0-9]{3}[)-. ]? ?[0-9]{3}[. -]?[0-9]{4})`, 'g');
    let numberWithUnits = new RegExp(`([0-9,.-]+ (sqft|meter|inch|foot|cm|mm|yard|mile|gallon))`, 'g');
    let dates = extractDate(this.input, {direction: 'MDY', locale: 'en'});
    this.normalized = this.input
      .replace(/([,;:?.]+)( |$)/g, ' $1 ')
      .replace(nameRegExp, '>$1>')
      .replace(uncommonNameRegExp, ' >$1>')
      .replace(phoneRegExp, '>$1>')
      .replace(numberWithUnits, '>$1>')
      .replace(/>(.*?) >/g, '>$1> ');
    _.each(contractions, v => {
      this.normalized = this.normalized.replace(v[0], v[1]);
    });
    
    return this;
  }

  tokenize() {
    this.tokenized = [].concat.apply([], this.normalized.split('>').map(function(v,i){
      return i%2 ? v.trim() : v.split(' ')
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
      if(item.tags.current === 'CD') {
        try {
          item.meta.numberWithUnits = mathjs.unit(item.word);
        } catch(e) {

        }
      }
      return Word.instance(item);
    });
    return this;
  }

  isQuestion() {
    return _.last(this.tokenized) === '?';
  }

  isYesNoQuestion() {
    if(!this.getMainClause() || !this.getMainClause().tagged[0].tags.current) {
      return false;
    }
    return this.isQuestion() && !!this.getMainClause().tagged[0].tags.current.match(/(MD|VB)/gi);
  }

  isImperativeMood() {
    let mainClause = this.getMainClause();
    if(!mainClause) {
      return false;
    }
    return !this.isQuestion() && (
      mainClause.tagged[0].tags.current === 'VB' ||
      (mainClause.tagged.length > 1 && mainClause.tagged[0].tags.current === 'RB' && this.getMainClause().tagged[1].tags.current === 'VB')
    );
  }

  hasSubordinateClause() {
    if(this.getSubordinateClause()) {
      return true;
    }
    return false;
  }

  getMainClause() {
    if(!this.hasSubordinateClause()) {
      return this;
    }
    let temp = new Sentence(_(this.tagged)
      .differenceBy(this.getSubordinateClause(), 'index')
      .filter(item => {
        return item.tags && item.tags.current !== '.';
      })
      .dropWhile((item) => {
        return item.tags && item.tags.current == ',';
      })
      .map(item => item.word)
      .value()
      .join(' '));
    if(this.input !== temp.input && temp.hasSubordinateClause()) {
      return temp.getMainClause();
    }
    return temp;
  }

  getSubordinateClause() {
    //The most obvious subordinate clauses start with a conjunction
    let conjunction = _.find(this.tagged, item => {
      return item.tags.current && item.tags.current.match(/^(C(S|C)|IN)/g);
    });

    //If there is no conjunction, look for multiple subject/verb pairs
    if(!conjunction) {
      let tagSignature = _(this.tagged)
        .map(item => item.tags.current)
        .value()
        .join(' ');
      //Sentence has more than one subject and verb
      let matches = tagSignature.match(/\b[PN]\w+\b.*\bVB\w+\b(.*)\b([PN]\w+\b.*\bVB.*$)/);
      if(matches) {
        let combinedMatch = [matches[1].replace(/.*\b([PN]|VB)\w+/g, '').trim(), matches[2].trim()].join(' ').trim();
        return _(this.tagged)
          .takeRight(combinedMatch.split(' ').length)
          .filter(item => {
            return item.tags.current && item.tags.current !== '.';
          })
          .value();
      }
      return null;
    }
    let lastVerb = _.findLast(this.tagged, item => {
      return item.tags.current && item.tags.current.match(/^(VB)/g) ;
    });
    //there should be a verb after the conjunction...
    if(!lastVerb || lastVerb.index < conjunction.index) {
      return null;
    }
    //...and a subject before that verb
    let lastSubject = _.findLast(this.tagged, item => {
      return item.tags.current && item.tags.current.match(/^(N|P)/g) && item.index < lastVerb.index;
    });
    if(!lastSubject) {
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
        return item && verb && item.index > verb.index;
      })
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^(P|N)/g) && !item.tags.current.match(/^(NR)/g);
      })
      .value();
    if(!subjects.length) {
      subjects = _(this.tagged)
        .differenceBy(this.getSubordinateClause(), 'index')
        .filter(item => {
          return item.tags.current && item.tags.current.match(/^(P|N)/g && !item.tags.current.match(/^(NR)/g));
        })
        .value();
        if(!subjects.length) {
          return null;
        }
    }
    return subjects.shift();
  }

  getSubjectPhrase() {
    let verb = this.getMainVerb();
    let words = _(this.tagged)
      .differenceBy(this.getSubordinateClause(), 'index')
      .dropRightWhile((item) => {
        return item && verb && item.index >= verb.index;
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
        return item && verb && item.index > verb.index;
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

  getAllVerbPhrases() {
    let verbs = [];
    let currentVerb = []
    _.each(this.tagged, item => {
      if(item.tags.current && item.tags.current.match(/^(RB|MD|VB)/g)) {
        currentVerb.push(item);
      } else {
        if(currentVerb.length) {
          verbs.push(new Sentence(currentVerb));
        }
        currentVerb = []
      }
    });
    return verbs;
  }

  getPredicateTail() {
    let verb = this.getMainVerb();
    let subject = this.getSubjectPhrase();
    if(!verb || !subject) {
      return new Sentence('');
    }
    let words = _(this.tagged)
      .dropWhile((item) => {
        return item && verb && item.index < verb.index;
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  getPredicateAdjective() {
    let verb = this.getMainVerb();
    let subject = this.getSubjectPhrase();
    if(!verb || !subject) {
      return new Sentence('');
    }
    let words = _(this.tagged)
      .dropWhile((item) => {
        return item.index <= verb.index || item.index <= subject.index;
      })
      .takeWhile((item) => {
        return item.tags.current && item.tags.current.match(/^(R|J)/g);
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  getPredicateNoun() {
    let verb = this.getMainVerb();
    let subject = this.getSubjectPhrase();
    if(!verb || !subject) {
      if(!this.isImperativeMood()) {
        return new Sentence('');
      }
      if(!subject) {
        subject = {index: 0};
      }
    }
    let words = _(this.tagged)
      .dropWhile((item) => {
        return item.index <= verb.index || item.index <= subject.index;
      })
      .takeWhile((item) => {
        return item.tags.current && item.tags.current.match(/^(R|J|P|N|D|Q|O|I|V)/g);
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  getNounPhrase(noun) {
    let words = _(this.tagged)
      .dropRightWhile((item) => {
        return item.current !== noun;
      })
      .dropWhile((item) => {
        return item.tags.current && !item.tags.current.match(/^(A|J)/g);
      })
      .value();
    if(!words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  getNounObjects() {
    let verb = this.getMainVerb();
    let rest = this.tagged.slice(verb.index + 1);
    let firstNonSubjectNoun = _.find(rest, item => {
      return item.tags.current && item.tags.current.match(/^(N|P)/g) && !item.tags.current.match(/\$/g);
    });
    
    let nounObjects = [];
    if(firstNonSubjectNoun) {
      nounObjects.push(firstNonSubjectNoun);
      let secondNonSubjectNoun = _.find(this.tagged, item => {
        return item.tags.current && item.tags.current.match(/^(N|P)/g) && !item.tags.current.match(/\$/g);
      }, firstNonSubjectNoun.index + 1);
      if(secondNonSubjectNoun) {
        nounObjects.push(secondNonSubjectNoun);
      }
    }
    return nounObjects;
  }

  getDirectObjectPhrase() {
    let verb = this.getMainVerb();
    let nounObjects = this.getNounObjects();
    let words;
    if(nounObjects.length === 2) {
      words = this.tagged.slice(nounObjects[0].index + 1, nounObjects[1].index + 1);
    } else if(nounObjects.length === 1) {
      words = this.tagged.slice(verb.index + 1, nounObjects[0].index + 1);
    }
    
    if(!words || !words.length) {
      return new Sentence('');
    }
    return new Sentence(words);
  }

  getIndirectObjectPhrase() {
    let verb = this.getMainVerb();
    let nounObjects = this.getNounObjects();
    let words;
    if(nounObjects.length === 2) {
      words = this.tagged.slice(verb.index + 1, nounObjects[0].index + 1);
    }
    if(!words || !words.length) {
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

  replace(tag, string, type) {
    switch (type) {
      case 'string':
        this.reset(this.current.replace(tag, string));
        break;
      default:
        this.insert(string, {replace: tag})
    }
    return this;
  }

  transform(tag, transform, params) {
    if(tag.match(/^\$/)) {
      let method = 'get' + _.upperFirst(tag.replace(/^\$/, ''));
      if(typeof this[method] === "function") {
        let tag = this[method].apply(this, []);
        if(!_.isArray(tag)) {
          tag = [tag];
        }
        _.each(tag, tag => {
          let string = null;
          if(tag instanceof Sentence) {
            let verb = Verb.instance(tag.toString());
            verb[transform].apply(verb, params);
            string = verb.toString();
          } else if(tag && tag.tags.current && tag.tags.current.match(/^VB/)) {
            let verb = Verb.instance(tag.word);
            if(typeof verb[transform] === "function") {
              verb[transform].apply(verb, params);
              string = verb.toString();
            }
          } else if(tag && tag.tags.current && tag.tags.current.match(/^NN/)) {
            let noun = Noun.instance(tag.word);
            if(typeof noun[transform] === "function") {
              noun[transform].apply(noun, params);
              string = noun.toString();
            }
          }
          if(string) {
            this.replace(tag.toString(), new Sentence(string), 'string');
          }
        });
      }
    }
    return this;
  }
}

module.exports.instance = (string, lexicon = null) => {
  return new Sentence(string, lexicon);
};
module.exports.model = Sentence;
