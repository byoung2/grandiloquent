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
