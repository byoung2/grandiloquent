const _ = require('lodash');
const Plugin = require('./plugin.js');
const Pronoun = require('./pronoun.js');
const Sentence = require('./sentence.js');
const irregular = require('./../data/irregularVerbs.js');

class Verb extends Plugin {
  constructor(string) {
    super(string);
    this.tagged = Sentence.instance(string).tagged;
  }

  getSubject() {
    let subject = _(this.tagged)
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^(N|P)/g);
      })
      .value();
    subject = _.first(subject);
    if(!subject) {
      return null;
    }
    return Sentence.instance(subject.word);
  }

  getAdverb() {
    let adverb = _(this.tagged)
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^(RB)/g);
      })
      .value();
    adverb = _.first(adverb);
    if(!adverb) {
      return null;
    }
    return Sentence.instance(adverb.word);
  }

  keepAdverb() {
    if(this.getAdverb()) {
      let adverbOffset = _.flatten([
        _(this.tagged)
          .filter(item => {
            return item.tags.current && item.tags.current.match(/^(RB)/g);
          })
          .map(item => item.index)
          .value(),
        _(this.tagged)
          .filter(item => {
            return item.tags.current && item.tags.current.match(/^(VB)/g);
          })
          .map(item => item.index)
          .value()
      ])
      .reduce((a,b) => a - b);
      if(adverbOffset < 0) {
        let verbArray = this.current.split(/ /g);
        let verb = verbArray.pop();
        verbArray.push(this.getAdverb());
        verbArray.push(verb);
        this.current = verbArray.join(' ');
      } else {
        this.current = this.current.concat(' ' + this.getAdverb());
      }

    }
    return this;
  }

  toBase() {
    let testVerb = _(this.tagged)
      .filter(item => {
        return item.tags.current && item.tags.current.match(/^(VB)/g);
      })
      .map(item => item.word)
      .value();
    let input = null;
    if(_.isArray(testVerb) && testVerb.length) {
      input = _.last(testVerb);
    } else {
      input = this
        .input
        .trim()
        .split(' ')
        .pop();
    }
    let irregularVerb = _.find(irregular, item => {
      let testVerb = _(new Verb(input).tagged)
        .filter(item => {
          return item.tags.current && item.tags.current.match(/^(VB)/g);
        })
        .map(item => item.word)
        .value();
      return _.find(_.concat(
        [item.present.default, item.past.default],
        _.values(item.present.singular),
        _.values(item.present.plural),
        _.values(item.past.singular),
        _.values(item.past.plural)
      ), item => {
        return testVerb.indexOf(item) !== -1;
      });
    });
    if(irregularVerb) {
      this.current = irregularVerb.base;
    } else {
      this.current = input
        .replace(/ied$/, 'yed')
        .replace(/([rlp])ies$/, '$1ys')
        .replace(/([aeiou])([kt])(ed|ing)$/, '$1$2e$3')
        .replace(/tt(ed|ing)$/, 't$1')
        .replace(/(ed|ing|s)$/, '');
    }
  
    return this;
  }

  toPlural() {
    let irregularVerb = _.find(irregular, item => {
      let testVerb = _(this.tagged)
        .filter(item => {
          return item.tags.current && item.tags.current.match(/^(VB)/g);
        })
        .map(item => item.word)
        .value();

      return _.find(_.concat(
        [item.present.default, item.past.default],
        _.values(item.present.singular),
        _.values(item.present.plural),
        _.values(item.past.singular),
        _.values(item.past.plural)
      ), item => {
        return testVerb[0] === item;
      });
    })
    if(irregularVerb) {
      this.current = irregularVerb.present.default;
    } else {
      let testVerb = _(this.tagged)
        .filter(item => {
          return item.tags.current && item.tags.current.match(/^(VB)/g);
        })
        .map(item => item.word)
        .value();
      let input = null;
      if(_.isArray(testVerb) && testVerb.length) {
        input = _.last(testVerb);
      } else {
        input = this
          .input
          .trim()
          .split(' ')
          .pop();
      }
      this.current = input
        .replace(/([rlp])ies$/, '$1ys')
        .replace(/s$/, '');
    }
    return this;
  }

  toInfinitive() {
    this.current = 'to ' + this.toBase();
    return this;
  }

  toGerund() {
    let baseVerb = this.toBase()
      .toString()
      .replace(/ie$/, 'y')
      .replace(/t$/, 'tt')
      .replace(/([^aeiou])e$/, '$1');
    this.current = baseVerb + 'ing';
    return this;
  }

  toPresentParticiple() {
    this.toGerund();
    return this;
  }

  toPastParticiple() {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      this.current = irregular[baseVerb].pastParticiples[0];
    } else {
      this.current = baseVerb
        .replace(/y$/, 'i')
        .replace(/([rlp])y$/, '$1i');
      this.current = baseVerb + 'ed';
    }
    return this;
  }

  toPresent(pronoun) {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      if(pronoun && pronoun instanceof Pronoun.model) {
        if(pronoun.meta.count == 1) {
          this.current = (irregular[baseVerb].present.singular[pronoun.meta.person] ?
            irregular[baseVerb].present.singular[pronoun.meta.person] :
            irregular[baseVerb].present.default);
        } else if(pronoun.meta.count == 2) {
          this.current = (irregular[baseVerb].present.plural[pronoun.meta.person] ?
            irregular[baseVerb].present.plural[pronoun.meta.person] :
            irregular[baseVerb].present.default);
        }
      } else {
        this.current = irregular[baseVerb].present.default;
      }
    } else {
      this.current = baseVerb
        .replace(/y$/, 'ie')
        .replace(/([rlp])y$/, '$1ie');
        if(pronoun && pronoun instanceof Pronoun.model) {
          if(pronoun.meta.count == 1 && pronoun.meta.person == 3) {
            this.current += 's';
          }
        }
    }
    let prepend = (pronoun ? pronoun + ' ' : '');
    this.current = prepend + this.current;
    return this;
  }

  toFuture(pronoun) {
    this.current = this.toBase().toString();
    let prepend = (pronoun ? pronoun + ' ' : '').concat('will ');
    this.current = prepend + this.current;
    return this;
  }

  toPast(pronoun) {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      if(pronoun && pronoun instanceof Pronoun.model) {
        if(pronoun.meta.count == 1) {
          this.current = (irregular[baseVerb].past.singular[pronoun.meta.person] ?
            irregular[baseVerb].past.singular[pronoun.meta.person] :
            irregular[baseVerb].past.default);
        } else if(pronoun.meta.count == 2) {
          this.current = (irregular[baseVerb].past.plural[pronoun.meta.person] ?
            irregular[baseVerb].past.plural[pronoun.meta.person] :
            irregular[baseVerb].past.default);
        }
      } else {
        this.current = irregular[baseVerb].past.default;
      }
    } else {
      this.current = baseVerb
        .replace(/y$/, 'i')
        .replace(/([rlp])y$/, '$1i')
        .replace(/e$/, '')
        .concat('ed');
    }
    let prepend = (pronoun ? pronoun + ' ' : '');
    this.current = prepend + this.current;
    return this;
  }

  toPresentProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPresent(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toPresent();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toFutureProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toFuture(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toFuture();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toPastProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPast(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toPast();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toPresentPerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toPresent(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('have');
      helperVerb.toPresent();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toFuturePerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toFuture(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('have');
      helperVerb.toFuture();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toPastPerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toPast(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('have');
      helperVerb.toPast();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toPresentPerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPresentPerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toPresentPerfect();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toFuturePerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toFuturePerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else if(this.getSubject()) {
      let helperVerb = new Verb('be');
      helperVerb.toFuturePerfect();
      this.current = this.getSubject().toString() + ' ' +helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toFuturePerfect();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  toPastPerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPastPerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      let helperVerb = new Verb('be');
      helperVerb.toPastPerfect();
      this.current = helperVerb.toString() + ' ' + this.current;
    }
    return this;
  }

  getTense() {
    if(this.clone().toPresent().toString() == this.current) {
      return 'present';
    } else if(this.clone().toFuture().toString() == this.current) {
      return 'future';
    } else if(this.clone().toPast().toString() == this.current) {
      return 'past';
    } else if(this.clone().toPresentProgressive().toString() == this.current) {
      return 'present progressive';
    } else if(this.clone().toFutureProgressive().toString() == this.current) {
      return 'future progressive';
    } else if(this.clone().toPastProgressive().toString() == this.current) {
      return 'past progressive';
    } else if(this.clone().toPresentPerfect().toString() == this.current) {
      return 'present perfect';
    } else if(this.clone().toFuturePerfect().toString() == this.current) {
      return 'future perfect';
    } else if(this.clone().toPastPerfect().toString() == this.current) {
      return 'past perfect';
    } else if(this.clone().toPresentPerfectProgressive().toString() == this.current) {
      return 'present perfect progressive';
    } else if(this.clone().toFuturePerfectProgressive().toString() == this.current) {
      return 'future perfect progressive';
    } else if(this.clone().toPastPerfectProgressive().toString() == this.current) {
      return 'past perfect progressive';
    }
    return null;
  }
}

module.exports.instance = (string) => {
  return new Verb(string);
};
module.exports.model = Verb;
