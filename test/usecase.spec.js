'use strict';


//dependencies
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const faker = require('faker');
const expect = require('chai').expect;
const searchable = require(path.join(__dirname, '..'));


//prepare schema
const PersonSchema = new Schema({
  firstName: {
    type: String,
    index: true,
    searchable: true
  },
  surname: {
    type: String,
    index: true,
    searchable: true
  }
});
PersonSchema.plugin(searchable);
const Person = mongoose.model('UseCase', PersonSchema);


describe('use cases', () => {

  before((done) => {
    Person.deleteMany(done);
  });

  let person = {
    firstName: _.toUpper(faker.name.firstName()),
    surname: _.toLower(faker.name.lastName()),
  };

  before((done) => {
    Person.create(person, (error, created) => {
      person = created;
      done(error, created);
    });
  });

  it('should be able to search on uppercased fields', (done) => {
    const q = person.firstName;
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  it('should be able to search on uppercased fields', (done) => {
    const q = _.toLower(person.firstName);
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  it('should be able to search on uppercased fields', (done) => {
    const q = _.startCase(person.firstName);
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  it('should be able to search on lowercased fields', (done) => {
    const q = person.surname;
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  it('should be able to search on lowercased fields', (done) => {
    const q = _.toUpper(person.surname);
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  it('should be able to search on lowercased fields', (done) => {
    const q = _.startCase(person.surname);
    Person.search(q, (error, results) => {

      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      //assert single result
      const found = results[0];
      expect(found.firstName).to.equal(person.firstName);
      expect(found.surname).to.equal(person.surname);

      done(error, results);
    });
  });

  after((done) => {
    Person.deleteMany(done);
  });

});