const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

describe('Pronoun', () => {
  describe('plural to singular', () => {
    it('should convert 3rd person pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('they')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('he');
    });

    it('should convert 3rd person female pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('they')
        .setGender('female')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('she');
    });

    it('should convert 3rd person male or female pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('they')
        .setGender('or')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('he or she');
    });

    it('should convert 3rd person male or female pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('they')
        .setGender('slash')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('he/she');
    });

    it('should convert 1st person pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('we')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('I');
    });

    it('should convert 2nd person pronoun', () => {
      let pronoun = grandiloquent
        .pronoun('you')
        .toSingular()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('you');
    });
  });

  describe('change person', () => {
    it('should convert to 1st person', () => {
      let pronoun = grandiloquent
        .pronoun('he')
        .toFirstPerson()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('I');
    });

    it('should convert to 2nd person', () => {
      let pronoun = grandiloquent
        .pronoun('we')
        .toSecondPerson()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('you');
    });

    it('should convert to 3rd person', () => {
      let pronoun = grandiloquent
        .pronoun('I')
        .setGender('or')
        .toThirdPerson()
        .toString();
      pronoun.should.be.a('string');
      pronoun.should.equal('he or she');
    });
  });
});

describe('Verb', () => {
  describe('base', () => {
    it('should convert singular 3rd person present tense regular verb to base form', () => {
      let verb = grandiloquent
        .verb('walks')
        .toBase()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('walk');
    });

    it('should convert singular 3rd person present tense regular verb to infinitive form', () => {
      let verb = grandiloquent
        .verb('walks')
        .toInfinitive()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('to walk');
    });

    it('should convert base regular verb to present form', () => {
      let verb = grandiloquent
        .verb('walk')
        .toPresent()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('walk');
    });

    it('should convert base regular verb to future form', () => {
      let verb = grandiloquent
        .verb('walk')
        .toFuture()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('will walk');
    });

    it('should convert base regular verb to past form', () => {
      let verb = grandiloquent
        .verb('walk')
        .toPast()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('walked');
    });

    it('should convert base regular verb to future perfect progressive form', () => {
      let verb = grandiloquent
        .verb('walk')
        .toFuturePerfectProgressive()
        .toString();
      verb.should.be.a('string');
      verb.should.equal('will have been walking');
    });
  });
});

describe('Sentence', () => {
  describe('init', () => {
    it('should it a sentence without changing it', () => {
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
      let verb = grandiloquent
        .sentence('I cannot understand why you called Uber to pick me up.')
        .getSubject();
      verb.should.be.an.object;
      verb.should.have.property('word', 'I');
    });

    it('should identify the subject phrase', () => {
      let verb = grandiloquent
        .sentence('Fortunately most doctors agree that diet and exercise are good for your health.')
        .getSubjectPhrase()
        .toString();
      verb.should.be.a.string;
      verb.should.equal('most doctors');
    });

    it('should identify the subject-verb phrase', () => {
      let verb = grandiloquent
        .sentence('I cannot understand why you called Uber to pick me up.')
        .getSubjectVerbPhrase()
        .toString();
      verb.should.not.be.null;
      verb.should.be.a.string;
      verb.should.equal('I can not understand');
    });

    it('should identify the subject-verb phrase', () => {
      let verb = grandiloquent
        .sentence('Most doctors reluctantly agree that diet and exercise are good for your health.')
        .getSubjectVerbPhrase()
        .toString();
      verb.should.be.a.string;
      verb.should.equal('Most doctors reluctantly agree');
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

    it('should insert text at a location relative to a named tag', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store')
        .insert('slowly', {after: '$mainVerb'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I walked slowly to the store');
    });

    it('should insert text at a location relative to a named tag', () => {
      let sentence = grandiloquent
        .sentence('I walked to the store')
        .insert('slowly', {before: '$mainVerb'})
        .toString();
      sentence.should.be.a.string;
      sentence.should.equal('I slowly walked to the store');
    });
  });
});
