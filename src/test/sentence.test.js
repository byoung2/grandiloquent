const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

describe('Sentence', () => {
  describe('init', () => {
    it('should init a sentence without changing it', () => {
      let sentence = grandiloquent
        .sentence('If you wanna be my lover, you gotta get with my friends.')
        .toString();
      sentence.should.be.a('string');
      sentence.should.equal('If you wanna be my lover, you gotta get with my friends.');
    });

    it('should normalize a sentence to prepare for tagging', () => {
      let sentence = grandiloquent
        .sentence('If you wanna be my lover, you gotta get with my friends.');
      sentence.normalized.should.be.a('string');
      sentence.normalized.should.equal('If you want to be my lover , you got to get with my friends . ');
    });
  });

  describe('tokenize', () => {
    it('should split a sentence into words', () => {
      let sentence = grandiloquent
        .sentence('If you wanna be my lover, you gotta get with my friends.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(16);
    });

    it('should not split proper names', () => {
      let sentence = grandiloquent
        .sentence('Are you the legal guardian of John Connor?');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(8);
      sentence.tagged[6].should.have.property('word', 'John Connor');
      sentence.tagged[6].should.have.deep.property('tags.current', 'NP');
    });

    it('should recognize proper names at the start of the sentence', () => {
      let sentence = grandiloquent
        .sentence('John Connor is the leader of the resistance.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(8);
      sentence.tagged[0].should.have.property('word', 'John Connor');
      sentence.tagged[0].should.have.deep.property('tags.current', 'NP');
    });

    it('should recognize unknown words as noun', () => {
      let sentence = grandiloquent
        .sentence('I drive a minivan to work.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(7);
      sentence.tagged[3].should.have.property('word', 'minivan');
      sentence.tagged[3].should.have.deep.property('tags.current', 'NN');
    });

    it('should accept new entries to lexicon', () => {
      let sentence = grandiloquent
        .sentence("I'm going to drax them sklounst.", {
          drax: ['VB'],
          sklounst: ['JJ']
        });
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(8);
      sentence.tagged[4].should.have.property('word', 'drax');
      sentence.tagged[4].should.have.deep.property('tags.current', 'VB');
    });

    it('should recognize -way words as possible noun', () => {
      let sentence = grandiloquent
        .sentence('I parked in the driveway.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(6);
      sentence.tagged[4].should.have.property('word', 'driveway');
      sentence.tagged[4].should.have.deep.property('tags.current', 'NN');
    });

    it('should not recognize capital words start of the sentence as proper names', () => {
      let sentence = grandiloquent
        .sentence('Meet John Connor who is the leader of the resistance.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(10);
      sentence.tagged[1].should.have.property('word', 'John Connor');
      sentence.tagged[1].should.have.deep.property('tags.current', 'NP');
    });

    it('should recognize uncommon names as proper names', () => {
      let sentence = grandiloquent
        .sentence('Meet your new president Abbcdefg Hijklmnop.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(6);
      sentence.tagged[4].should.have.property('word', 'Abbcdefg Hijklmnop');
      sentence.tagged[4].should.have.deep.property('tags.current', 'NP');
    });

    it('should recognize wh- words as special adverbs', () => {
      let sentence = grandiloquent
        .sentence('Where is the bathroom?');
      sentence.tagged.should.be.an('array');
      sentence.tagged[0].should.have.deep.property('tags.current', 'WRB');
    });

    
    it('should recognize phone number as a single token', function () {
      var sentence = grandiloquent.sentence('My phone number is (310) 123-4567');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(5);
      sentence.tagged[4].should.have.property('word', '(310) 123-4567');
    });

    it.skip('should recognize date as a single token', function () {
      var sentence = grandiloquent.sentence('My birthday is on 12/30/1980.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(6);
      sentence.tagged[4].should.have.property('word', '12/30/1980');
    });

    it.skip('should recognize date as a single token', function () {
      var sentence = grandiloquent.sentence('My birthday is on February 3rd, 1980.');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(6);
      sentence.tagged[4].should.have.property('word', '2/3/1980');
    });

    it('should recognize email as a single token', function () {
      var sentence = grandiloquent.sentence('My email address is user@host.com');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(5);
      sentence.tagged[4].should.have.property('word', 'user@host.com');
    });

    it('should recognize number with units as a single token', function () {
      var sentence = grandiloquent.sentence('I have a 1000 cm rope');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(5);
      sentence.tagged[3].should.have.property('word', '1000 cm');
    });

    it('should recognize number with units as a single token', function () {
      var sentence = grandiloquent.sentence('I have a 1000 sqft house');
      sentence.tagged.should.be.an('array');
      sentence.tagged.should.have.lengthOf(5);
      sentence.tagged[3].should.have.property('word', '1000 sqft');
    });
  });

  describe('meta', () => {
    it('should identify a question', () => {
      let sentence = grandiloquent
        .sentence('Are you the legal guardian of John Connor?');
      sentence.isQuestion().should.be.true;
    });

    it('should not falsely identify a question', () => {
      let sentence = grandiloquent
        .sentence('You are the legal guardian of John Connor.');
      sentence.isQuestion().should.be.false;
    });

    it('should identify a yes/no question', () => {
      let sentence = grandiloquent
        .sentence('Are you the legal guardian of John Connor?');
      sentence.isYesNoQuestion().should.be.true;
    });

    it('should identify a yes/no question with subordinate clause', () => {
      let sentence = grandiloquent
        .sentence('Before you came to America, were you the legal guardian of John Connor?');
      sentence.isYesNoQuestion().should.be.true;
    });

    it('should identify a non yes/no question', () => {
      let sentence = grandiloquent
        .sentence('Where is John Connor?');
      sentence.isYesNoQuestion().should.be.false;
    });

    it('should recognize imperative mood', () => {
      let sentence = grandiloquent
        .sentence('Call now!');
      sentence.tagged.should.be.an('array');
      sentence.isImperativeMood().should.be.true;
    });

    it('should recognize imperative mood with adverb first', () => {
      let sentence = grandiloquent
        .sentence('Quickly walk away!');
      sentence.tagged.should.be.an('array');
      sentence.isImperativeMood().should.be.true;
    });

    it('should recognize imperative mood with subordinate clause first', () => {
      let sentence = grandiloquent
        .sentence('When you get home, call me!');
      sentence.tagged.should.be.an('array');
      sentence.isImperativeMood().should.be.true;
    });

    it('should identify a subordinate clause', () => {
      let sentence = grandiloquent
        .sentence('I was sleeping when you came home.');
      sentence.hasSubordinateClause().should.be.true;
    });

    it('should identify a subordinate clause at the start of the sentence', () => {
      let sentence = grandiloquent
        .sentence('When you came home, I was sleeping.');
      sentence.hasSubordinateClause().should.be.true;
    });

    it('should identify a nonobvious subordinate clause', () => {
      let sentence = grandiloquent
        .sentence('The dog was the biggest one I could find.');
      sentence.hasSubordinateClause().should.be.true;
      grandiloquent.sentence(sentence.getSubordinateClause()).toString().should.equal('I could find');
    });

    it('should identify a nonobvious subordinate clause with a complex subject', () => {
      let sentence = grandiloquent
        .sentence('Yesterday was the best concert the talented singer had ever performed.');
      sentence.hasSubordinateClause().should.be.true;
      grandiloquent.sentence(sentence.getSubordinateClause()).toString().should.equal('the talented singer had ever performed');
    });

    it('should identify a main clause', () => {
      let sentence = grandiloquent
        .sentence(`Oh god this sushi was the worst quality fish I have ever tried in my life and I'm not kidding.`);
      sentence.hasSubordinateClause().should.be.true;
      sentence.getMainClause().toString().should.equal('Oh god this sushi was the worst quality fish');
    });

    it('should identify the main verb', () => {
      let verb = grandiloquent
        .sentence('While you walked to the car, I called Uber to pick me up.')
        .getMainVerb();
      verb.should.be.an.object;
      verb.should.have.property('word', 'called');
    });

    it('should identify the main verb', () => {
      let verb = grandiloquent
        .sentence('I cannot understand why you called Uber to pick me up.')
        .getMainVerb();
      verb.should.be.an.object;
      verb.should.have.property('word', 'understand');
    });

    it('should identify the subject', () => {
      let subject = grandiloquent
        .sentence('I cannot understand why you called Uber to pick me up.')
        .getSubject();
      subject.should.be.an.object;
      subject.should.have.property('word', 'I');
    });

    it('should identify the subject when ambiguous nouns are present', () => {
      let subject = grandiloquent
        .sentence('Yesterday I ate cake.')
        .getSubject();
      subject.should.be.an.object;
      subject.should.have.property('word', 'I');
    });

    it('should identify the subject phrase', () => {
      let subject = grandiloquent
        .sentence('Fortunately most doctors agree that diet and exercise are good for your health.')
        .getSubjectPhrase()
        .toString();
      subject.should.be.a.string;
      subject.should.equal('most doctors');
    });

    it('should identify the subject-verb phrase', () => {
      let subject = grandiloquent
        .sentence('I cannot understand why you called Uber to pick me up.')
        .getSubjectVerbPhrase()
        .toString();
      subject.should.not.be.null;
      subject.should.be.a.string;
      subject.should.equal('I can not understand');
    });

    it('should identify the subject-verb phrase', () => {
      let subject = grandiloquent
        .sentence('Most doctors reluctantly agree that diet and exercise are good for your health.')
        .getSubjectVerbPhrase()
        .toString();
      subject.should.be.a.string;
      subject.should.equal('Most doctors reluctantly agree');
    });

    it('should identify the predicate adjective phrase', () => {
      let phrase = grandiloquent
        .sentence('I am extremely angry at you.')
        .getPredicateAdjective()
        .toString();
      phrase.should.be.a.string;
      phrase.should.equal('extremely angry');
    });

    it('should identify the predicate noun phrase', () => {
      let phrase = grandiloquent
        .sentence('I am just a simple farmer.')
        .getPredicateNoun()
        .toString();
      phrase.should.be.a.string;
      phrase.should.equal('just a simple farmer');
    });

    it('should identify the predicate noun phrase', () => {
      let phrase = grandiloquent
        .sentence('Give me a break.')
        .getPredicateNoun()
        .toString();
      phrase.should.be.a.string;
      phrase.should.equal('me');
    });

    it('should identify the predicate noun phrase', () => {
      let phrase = grandiloquent
        .sentence('tell me what you think.')
        .getPredicateNoun()
        .toString();
      phrase.should.be.a.string;
      phrase.should.equal('me what you think');
    });

    it('should identify the direct object of a verb', () => {
      let object = grandiloquent
        .sentence('I will walk the dog.')
        .getDirectObjectPhrase()
        .toString();
      object.should.be.a.string;
      object.should.equal('the dog');
    });

    it('should return empty string for nonexistent indirect object', () => {
      let object = grandiloquent
        .sentence('I will walk my dog.')
        .getIndirectObjectPhrase()
        .toString();
      object.should.be.a.string;
      object.should.equal('');
    });

    it('should identify the indirect object of a verb', () => {
      let object = grandiloquent
        .sentence('I will give the dog a bath.')
        .getIndirectObjectPhrase()
        .toString();
      object.should.be.a.string;
      object.should.equal('the dog');
    });

    it('should identify the direct object of a verb when an indirect object is present', () => {
      let object = grandiloquent
        .sentence('I will give the dog a bath.')
        .getDirectObjectPhrase()
        .toString();
      object.should.be.a.string;
      object.should.equal('a bath');
    });
  });

  describe('transform', () => {
    it('should append text before punctuation', () => {
      let sentence = grandiloquent
        .sentence('I walked.')
        .append('to the store')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I walked to the store.');
    });

    it('should append text before punctuation', () => {
      let sentence = grandiloquent
        .sentence('I walked...')
        .append('to the store')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I walked to the store...');
    });

    it('should prepend text', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store.')
        .prepend('Yesterday')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('Yesterday I walked to the store.');
    });

    it('should insert text at a specific location', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store')
        .insert('slowly', 2)
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I walked slowly to the store');
    });

    it('should insert text at a location after a named tag', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store')
        .insert('slowly', {after: '$mainVerb'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I walked slowly to the store');
    });

    it('should insert text at a location before a named tag', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store')
        .insert('slowly', {before: '$mainVerb'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I slowly walked to the store');
    });

    it('should insert text at a location after a named tag', () => {
      let sentence = grandiloquent
        .sentence('After eating breakfast, Joe walked home.')
        .insert('a happy', {before: '$subject'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After eating breakfast, a happy Joe walked home.');
    });

    it('should replace text of a named tag', () => {
      let sentence = grandiloquent
        .sentence('After eating breakfast, Joe walked home.')
        .insert('Bill', {replace: '$subject'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After eating breakfast, Bill walked home.');
    });

    it('should replace text of a named tag (alias method)', () => {
      let sentence = grandiloquent
        .sentence('After eating breakfast, Joe walked home.')
        .replace('$subject', 'Bill')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After eating breakfast, Bill walked home.');
    });

    it('should transform a named tag (noun) to plural', () => {
      let sentence = grandiloquent
        .sentence('After eating breakfast, the student walked home.')
        .transform('$subject', 'toPlural')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After eating breakfast, the students walked home.');
    });

    it('should transform a named tag (verb) to plural', () => {
      let sentence = grandiloquent
        .sentence('The student walks home.')
        .transform('$mainVerb', 'toPast')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('The student walked home.');
    });

    it('should transform the main verb from future to past', () => {
      let sentence = grandiloquent
        .sentence('After lunch the student will walk home.')
        .transform('$mainVerbPhrase', 'toPast')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After lunch the student walked home.');
    });

    it('should transform all verbs from future to past', () => {
      let sentence = grandiloquent
        .sentence('After lunch the student will walk home while his teacher grades papers.')
        .transform('$allVerbPhrases', 'toPast')
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('After lunch the student walked home while his teacher graded papers.');
    });
  });
});
