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

  describe('meta', () => {
    it('should get the gender', () => {
      let pronoun = grandiloquent
        .pronoun('he')
        .getGender();
      pronoun.should.be.a('string');
      pronoun.should.equal('male');
    });

    it('should get the person', () => {
      let pronoun = grandiloquent
        .pronoun('he')
        .getPerson();
      pronoun.should.be.a('number');
      pronoun.should.equal(3);
    });
  });
});
