const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

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
