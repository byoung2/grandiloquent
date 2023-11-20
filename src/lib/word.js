const _ = require('lodash');
const Plugin = require('./plugin.js');
const partsOfSpeech = require('./../data/partsOfSpeech.js');

class Word extends Plugin {
  constructor(word) {
    if(_.isObject(word)) {
      super(word.word);
      this.word = word.word;
      this.index = (!_.isNaN(word.index) ? word.index : null);
      this.tags = _.defaultsDeep(word.tags, {
        all: [],
        current: null
      });
      this.meta = _.defaultsDeep(word.meta, {
        reason: null,
        tags: {
          current: 'NN'
        }
      });
    } else {
      super(word);
      this.tags = {
        all: [],
        current: null
      };
      this.meta = {
        reason: null
      };
      if(partsOfSpeech.lexicon[word.toLowerCase()]) {
        this.tags.all = partsOfSpeech.lexicon[word.toLowerCase()];
        if(this.tags.all.length == 1) {
          this.tags.current = this.tags.all[0];
          this.meta.pos = partsOfSpeech.tags[this.tags.current];
        }
      } else {
        this.tags.all = partsOfSpeech.fallback(word);
        if(this.tags.all.length == 1) {
          this.tags.current = this.tags.all[0];
          this.meta.pos = partsOfSpeech.tags[this.tags.current];
        }
      }
      if(!this.tags.current && this.tags.all.length) {
        this.tags.current = this.tags.all[0];
        this.meta.pos = partsOfSpeech.tags[this.tags.current];
        this.meta.reason = 'default';
      }
      if(!this.meta.reason) {
        console.log('no reason')
        this.tags.current = 'NN';
      }
    }
  }
}

module.exports.instance = (string) => {
  return new Word(string);
};
module.exports.model = Word;
