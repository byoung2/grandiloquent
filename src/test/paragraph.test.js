const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

describe('Paragraph', () => {
  describe('init', () => {
    it('should split a paragraph into sentences', () => {
      let paragraph = grandiloquent
        .paragraph('I came. I saw. I conquered.');
      paragraph.sentences.should.be.an('array');
      paragraph.sentences[1].input.should.equal('I saw.');
    });

    it('should not split on abbreviations', () => {
      let paragraph = grandiloquent
        .paragraph('Mr. Smith wanted to R.S.V.P. A.S.A.P. to avoid missing the party.');
      paragraph.sentences.should.be.an('array');
      paragraph.sentences.should.have.lengthOf(1)
    });
  });

  describe('coreference', () => {
    it('should map pronoun subject references', () => {
      let paragraph = grandiloquent
        .paragraph('I saw Bob play the guitar. He can shred. I wish he could teach me someday.')
        .resolveCoreferences();
      paragraph.sentences.should.be.an('array');
      paragraph.sentences[1].tagged.should.be.an('array');
      paragraph.sentences[1].tagged[0].should.have.property('coreference');
      paragraph.sentences[1].tagged[0].coreference.word.should.equal('Bob');
    });

    it('should map pronoun object references', () => {
      let paragraph = grandiloquent
        .paragraph('I saw Bob play the guitar. I gave him a new Strat.')
        .resolveCoreferences();
      paragraph.sentences.should.be.an('array');
      paragraph.sentences[1].tagged.should.be.an('array');
      paragraph.sentences[1].tagged[2].should.have.property('coreference');
      paragraph.sentences[1].tagged[2].coreference.word.should.equal('Bob');
    });

    it('should map pronoun references according to gender', () => {
      let paragraph = grandiloquent
        .paragraph('Jane saw Bob play the guitar. She was very impressed.')
        .resolveCoreferences();
      paragraph.sentences.should.be.an('array');
      paragraph.sentences[1].tagged.should.be.an('array');
      paragraph.sentences[1].tagged[0].should.have.property('coreference');
      paragraph.sentences[1].tagged[0].coreference.word.should.equal('Jane');
    });
  });

  describe('assertions', () => {
    it('should extract basic assertions made in the paragraph', () => {
      let assertions = grandiloquent
        .paragraph('Joe walked to the store. Joe is a great teacher.')
        .getAssertions();
      assertions.should.be.an('array');

    });
  });
});
