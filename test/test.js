const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

describe('Pronoun', () => {
  describe('plural to singular', () => {
    it('should convert 3rd person pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('they')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('he');
    });

    it('should convert 3rd person female pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('they')
        .setGender('female')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('she');
    });

    it('should convert 3rd person male or female pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('they')
        .setGender('or')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('he or she');
    });

    it('should convert 3rd person male or female pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('they')
        .setGender('slash')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('he/she');
    });

    it('should convert 1st person pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('we')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('I');
    });

    it('should convert 2nd person pronoun', () => {
      var pronoun = grandiloquent
        .pronoun('you')
        .toSingular()
        .toString();
        pronoun.should.be.a('string');
        pronoun.should.equal('you');
    });
  });
});


describe('Verb', () => {
  describe('base', () => {
    it('should convert singular 3rd person present tense regular verb to base form', () => {
      var verb = grandiloquent
        .verb('walks')
        .toBase()
        .toString();
        verb.should.be.a('string');
        verb.should.equal('walk');
    });

    it('should convert singular 3rd person present tense regular verb to infinitive form', () => {
      var verb = grandiloquent
        .verb('walks')
        .toInfinitive()
        .toString();
        verb.should.be.a('string');
        verb.should.equal('to walk');
    });

    it('should convert base regular verb to present form', () => {
      var verb = grandiloquent
        .verb('walk')
        .toPresent()
        .toString();
        verb.should.be.a('string');
        verb.should.equal('walk');
    });

    it('should convert base regular verb to future form', () => {
      var verb = grandiloquent
        .verb('walk')
        .toFuture()
        .toString();
        verb.should.be.a('string');
        verb.should.equal('will walk');
    });

    it('should convert base regular verb to past form', () => {
      var verb = grandiloquent
        .verb('walk')
        .toPast()
        .toString();
        verb.should.be.a('string');
        verb.should.equal('walked');
    });
  });
});
