const _ = require('lodash');
const irregularVerbs = {
  'be': {
    base: 'be',
    present: {
      singular: {
        1: 'am',
        3: 'is'
      },
      default: 'are'
    },
    past: {
      singular: {
        1: 'was',
        3: 'was'
      },
      default: 'were'
    },
    pastParticiples: ['been'],
  },
  'have': {
    base: 'have',
    present: {
      singular: {
        3: 'has'
      },
      default: 'have'
    },
    past: {
      default: 'had'
    },
    pastParticiples: ['had'],
  },
  'do': {
    base: 'do',
    present: {
      singular: {
        1: 'does'
      },
      default: 'do'
    },
    past: {
      default: 'did'
    },
    pastParticiples: ['done'],
  },
  'give': {
    base: 'give',
    past: {
      default: 'gave'
    },
    pastParticiples: ['given'],
  },
  'say': {
    base: 'say',
    past: {
      default: 'said'
    },
    pastParticiples: [ 'said' ]
  },
  'make': {
    base: 'make',
    past: {
      default: 'made'
    },
    pastParticiples: [ 'made' ]
  },
  'go': {
    base: 'go',
    past: {
      default: 'went'
    },
    pastParticiples: [ 'gone' ]
  },
  'take': {
    base: 'take',
    past: {
      default: 'took'
    },
    pastParticiples: [ 'taken' ]
  },
  'come': {
    base: 'come',
    past: {
      default: 'came'
    },
    pastParticiples: [ 'come' ]
  },
  'see': {
    base: 'see',
    past: {
      default: 'saw'
    },
    pastParticiples: [ 'seen' ]
  },
  'know': {
    base: 'know',
    past: {
      default: 'knew'
    },
    pastParticiples: [ 'known' ]
  },
  'get': {
    base: 'get',
    past: {
      default: 'got'
    },
    pastParticiples: [ 'got', 'gotten' ]
  },
  'give': {
    base: 'give',
    past: {
      default: 'gave'
    },
    pastParticiples: [ 'given' ]
  },
  'find': {
    base: 'find',
    past: {
      default: 'found'
    },
    pastParticiples: [ 'found' ]
  },
  'think': {
    base: 'think',
    past: {
      default: 'thought'
    },
    pastParticiples: [ 'thought' ]
  },
  'tell': {
    base: 'tell',
    past: {
      default: 'told'
    },
    pastParticiples: [ 'told' ]
  },
  'become': {
    base: 'become',
    past: {
      default: 'became'
    },
    pastParticiples: [ 'become' ]
  },
  'show': {
    base: 'show',
    past: {
      default: 'showed'
    },
    pastParticiples: [ 'shown' ]
  },
  'leave': {
    base: 'leave',
    past: {
      default: 'left'
    },
    pastParticiples: [ 'left' ]
  },
  'feel': {
    base: 'feel',
    past: {
      default: 'felt'
    },
    pastParticiples: [ 'felt' ]
  },
  'put': {
    base: 'put',
    past: {
      default: 'put'
    },
    pastParticiples: [ 'put' ]
  },
  'bring': {
    base: 'bring',
    past: {
      default: 'brought'
    },
    pastParticiples: [ 'brought' ]
  },
  'begin': {
    base: 'begin',
    past: {
      default: 'began'
    },
    pastParticiples: [ 'begun' ]
  },
  'keep': {
    base: 'keep',
    past: {
      default: 'kept'
    },
    pastParticiples: [ 'kept' ]
  },
  'hold': {
    base: 'hold',
    past: {
      default: 'held'
    },
    pastParticiples: [ 'held' ]
  },
  'write': {
    base: 'write',
    past: {
      default: 'wrote'
    },
    pastParticiples: [ 'written' ]
  },
  'stand': {
    base: 'stand',
    past: {
      default: 'stood'
    },
    pastParticiples: [ 'stood' ]
  },
  'hear': {
    base: 'hear',
    past: {
      default: 'heard'
    },
    pastParticiples: [ 'heard' ]
  },
  'let': {
    base: 'let',
    past: {
      default: 'let'
    },
    pastParticiples: [ 'let' ]
  },
  'mean': {
    base: 'mean',
    past: {
      default: 'meant'
    },
    pastParticiples: [ 'meant' ]
  },
  'set': {
    base: 'set',
    past: {
      default: 'set'
    },
    pastParticiples: [ 'set' ]
  },
  'meet': {
    base: 'meet',
    past: {
      default: 'met'
    },
    pastParticiples: [ 'met' ]
  },
  'run': {
    base: 'run',
    past: {
      default: 'ran'
    },
    pastParticiples: [ 'run' ]
  },
  'pay': {
    base: 'pay',
    past: {
      default: 'paid'
    },
    pastParticiples: [ 'paid' ]
  },
  'sit': {
    base: 'sit',
    past: {
      default: 'sat'
    },
    pastParticiples: [ 'sat' ]
  },
  'speak': {
    base: 'speak',
    past: {
      default: 'spoke'
    },
    pastParticiples: [ 'spoken' ]
  },
  'lie': {
    base: 'lie',
    past: {
      default: 'lay'
    },
    pastParticiples: [ 'lain' ]
  },
  'lead': {
    base: 'lead',
    past: {
      default: 'led'
    },
    pastParticiples: [ 'led' ]
  },
  'read': {
    base: 'read',
    past: {
      default: 'read'
    },
    pastParticiples: [ 'read' ]
  },
  'grow': {
    base: 'grow',
    past: {
      default: 'grew'
    },
    pastParticiples: [ 'grown' ]
  },
  'lose': {
    base: 'lose',
    past: {
      default: 'lost'
    },
    pastParticiples: [ 'lost' ]
  },
  'fall': {
    base: 'fall',
    past: {
      default: 'fell'
    },
    pastParticiples: [ 'fallen' ]
  },
  'send': {
    base: 'send',
    past: {
      default: 'sent'
    },
    pastParticiples: [ 'sent' ]
  },
  'build': {
    base: 'build',
    past: {
      default: 'built'
    },
    pastParticiples: [ 'built' ]
  },
  'understand': {
    base: 'understand',
    past: {
      default: 'understood'
    },
    pastParticiples: [ 'understood' ]
  },
  'draw': {
    base: 'draw',
    past: {
      default: 'drew'
    },
    pastParticiples: [ 'drawn' ]
  },
  'break': {
    base: 'break',
    past: {
      default: 'broke'
    },
    pastParticiples: [ 'broken' ]
  },
  'spend': {
    base: 'spend',
    past: {
      default: 'spent'
    },
    pastParticiples: [ 'spent' ]
  },
  'cut': {
    base: 'cut',
    past: {
      default: 'cut'
    },
    pastParticiples: [ 'cut' ]
  },
  'rise': {
    base: 'rise',
    past: {
      default: 'rose'
    },
    pastParticiples: [ 'risen' ]
  },
  'drive': {
    base: 'drive',
    past: {
      default: 'drove'
    },
    pastParticiples: [ 'driven' ]
  },
  'buy': {
    base: 'buy',
    past: {
      default: 'bought'
    },
    pastParticiples: [ 'bought' ]
  },
  'wear': {
    base: 'wear',
    past: {
      default: 'wore'
    },
    pastParticiples: [ 'worn' ]
  },
  'choose': {
    base: 'choose',
    past: {
      default: 'chose'
    },
    pastParticiples: [ 'chosen' ]
  },
  'eat': {
    base: 'eat',
    past: {
      default: 'ate'
    },
    pastParticiples: [ 'eaten' ]
  },
};
module.exports = _.mapValues(irregularVerbs, item => {
  return _.defaultsDeep(item, {
    base: '',
    present: {
      singular: {},
      plural: {},
      default: ''
    },
    past: {
      singular: {},
      plural: {},
      default: ''
    },
    pastParticiples: [],
  });
});
