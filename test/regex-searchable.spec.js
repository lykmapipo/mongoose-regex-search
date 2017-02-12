'use strict';

//dependencies
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const faker = require('faker');
const expect = require('chai').expect;

//apply mongoose-autoset plugin
mongoose.plugin(require(path.join(__dirname, '..')));

//prepare schema
const PersonSchema = new Schema({
  age: {
    type: Number,
    index: true,
    searchable: true
  },
  name: {
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
  },
  contacts: [{ //TODO
    form: {
      type: String,
      default: 'Phone',
      index: true,
      searchable: true
    },
    value: {
      type: String,
      index: true,
      searchable: true
    }
  }],
  address: {
    type: String,
    index: true,
    searchable: true
  },
  titles: {
    type: [String],
    index: true,
    searchable: true
  },
  scores: {
    type: [Number],
    index: true,
    searchable: true
  }
});
const Person = mongoose.model('Person', PersonSchema);

describe('mongoose-regex-searchable', function () {

  let person = {
    age: faker.random.number({ min: 20, max: 45 }),
    name: {
      firstName: faker.name.firstName(),
      surname: faker.name.lastName()
    },
    address: faker.address.streetAddress(),
    titles: [faker.name.jobTitle(), faker.name.jobTitle()],
    scores: [
      faker.random.number({ min: 20, max: 45 }),
      faker.random.number({ min: 20, max: 45 })
    ]
  };

  before(function (done) {
    Person.create(person, function (error, created) {
      person = created;
      done(error, created);
    });
  });

  it('should be able to search using string schema fields', function (
    done) {
    Person
      .search(person.address, function (error, results) {

        expect(error).to.not.exist;
        expect(results).to.exist;
        expect(results).to.have.length.above(0);

        //assert single result
        const found = results[0];
        expect(found.address).to.exist;

        expect(found.name.firstName).to.equal(person.name.firstName);
        expect(found.name.lastName).to.equal(person.name.lastName);
        expect(found.address).to.equal(person.address);

        done(error, results);

      });
  });

  it('should be able to search using number schema fields', function (
    done) {
    Person
      .search(person.age, function (error, results) {

        expect(error).to.not.exist;
        expect(results).to.exist;
        expect(results).to.have.length.above(0);

        //assert single result
        const found = results[0];
        expect(found.address).to.exist;

        expect(found.name.firstName).to.equal(person.name.firstName);
        expect(found.name.lastName).to.equal(person.name.lastName);
        expect(found.address).to.equal(person.address);
        expect(found.age).to.equal(person.age);

        done(error, results);

      });
  });

  it('should be able to search using single embedded subdocs fields',
    function (done) {
      Person
        .search(person.firstName, function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found.address).to.exist;

          expect(found.name.firstName).to.equal(person.name.firstName);
          expect(found.name.lastName).to.equal(person.name.lastName);
          expect(found.address).to.equal(person.address);

          done(error, results);

        });
    });

  it('should be able to search using array of string schema fields',
    function (done) {
      Person
        .search(person.titles[0], function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found.address).to.exist;

          expect(found.name.firstName).to.equal(person.name.firstName);
          expect(found.name.lastName).to.equal(person.name.lastName);
          expect(found.address).to.equal(person.address);
          expect(found.titles).to.include.members(person.titles);

          done(error, results);

        });
    });

  it('should be able to search using array of number schema fields',
    function (done) {
      Person
        .search(person.scores[0], function (error, results) {

          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results).to.have.length.above(0);

          //assert single result
          const found = results[0];
          expect(found.address).to.exist;

          expect(found.name.firstName).to.equal(person.name.firstName);
          expect(found.name.lastName).to.equal(person.name.lastName);
          expect(found.address).to.equal(person.address);
          expect(found.titles).to.include.members(person.titles);
          expect(found.scores).to.include.members(person.scores);

          done(error, results);

        });
    });

  after(function (done) {
    Person.remove(done);
  });

});
