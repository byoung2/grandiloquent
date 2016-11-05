const chai = require('chai');
const grandiloquent = require('./../grandiloquent.js');
chai.should();

describe('Noun', () => {
  describe('singular to plural', () => {
    it('should convert regular noun to plural', () => {
      let noun = grandiloquent
        .noun('cow')
        .toPlural()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('cows');
    });

    it('should convert an irregular noun to plural', () => {
      let noun = grandiloquent
        .noun('mouse')
        .toPlural()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('mice');
    });

    it('should convert a classic noun to plural', () => {
      let noun = grandiloquent
        .noun('matrix')
        .toPlural()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('matrices');
    });

    it('should convert a -y word to plural', () => {
      let noun = grandiloquent
        .noun('pony')
        .toPlural()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('ponies');
    });
  });

  describe('plural to singular', () => {
    it('should convert regular noun to singular', () => {
      let noun = grandiloquent
        .noun('cows')
        .toSingular()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('cow');
    });

    it('should convert an irregular noun to singular', () => {
      let noun = grandiloquent
        .noun('mice')
        .toSingular()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('mouse');
    });

    it('should convert a classic noun to singular', () => {
      let noun = grandiloquent
        .noun('matrices')
        .toSingular()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('matrix');
    });

    it('should convert a -y word to singular', () => {
      let noun = grandiloquent
        .noun('ponies')
        .toSingular()
        .toString();
      noun.should.be.a('string');
      noun.should.equal('pony');
    });
  });
});
