'use strict';

//dependencies
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const faker = require('faker');
const expect = require('chai').expect;

//TODO add searchable doc and index it to support refs

//apply mongoose-autoset plugin
mongoose.plugin(require(path.join(__dirname, '..')));

//sub schema definition
const Relative = new Schema({
  name: {
    type: String,
    searchable: true
  }
});

const Country = new Schema({
  name: {
    type: String,
    searchable: true
  }
});

const City = new Schema({
  name: {
    type: String,
    searchable: true
  },
  country: Country
});

//nested
const Residence = new Schema({
  street: {
    type: String,
    searchable: true
  },
  city: City
});

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
  },
  brother: Relative,
  aunt: { type: Relative },
  sisters: { type: [Relative] },
  friends: [Relative],
  residence: Residence
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
    ],
    brother: { name: faker.name.findName() },
    aunt: { name: faker.name.findName() },
    sisters: [
      { name: faker.name.findName() },
      { name: faker.name.findName() }
    ],
    friends: [
      { name: faker.name.findName() },
      { name: faker.name.findName() }
    ],
    residence: { //nested
      street: faker.address.streetName(),
      city: {
        name: faker.address.city(),
        country: {
          name: faker.address.country()
        }
      }
    }
  };

  before(function (done) {
    Person.create(person, function (error, created) {
      person = created;
      done(error, created);
    });
  });

  it('should be able to navigate paths and build searchable fields',
    function () {
      expect(Person.SEARCHABLE_FIELDS).to.exist;
      expect(Person.SEARCHABLE_FIELDS).to.be.an('array');
      expect(Person.SEARCHABLE_FIELDS).to.have.length(15);

      //assert searchable fields
      expect(Person.SEARCHABLE_FIELDS).to.contain('age');
      expect(Person.SEARCHABLE_FIELDS).to.contain('name.firstName');
      expect(Person.SEARCHABLE_FIELDS).to.contain('name.surname');
      expect(Person.SEARCHABLE_FIELDS).to.contain('contacts.form');
      expect(Person.SEARCHABLE_FIELDS).to.contain('contacts.value');
      expect(Person.SEARCHABLE_FIELDS).to.contain('address');
      expect(Person.SEARCHABLE_FIELDS).to.contain('titles');
      expect(Person.SEARCHABLE_FIELDS).to.contain('scores');
      expect(Person.SEARCHABLE_FIELDS).to.contain('brother.name');
      expect(Person.SEARCHABLE_FIELDS).to.contain('aunt.name');
      expect(Person.SEARCHABLE_FIELDS).to.contain('sisters.name');
      expect(Person.SEARCHABLE_FIELDS).to.contain('friends.name');
      expect(Person.SEARCHABLE_FIELDS).to.contain('residence.street');
      expect(Person.SEARCHABLE_FIELDS).to.contain('residence.city.name');
      expect(Person.SEARCHABLE_FIELDS)
        .to.contain('residence.city.country.name');

    });

  it('should be able to search using string schema fields',
    function (done) {
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

  it('should be able to search using parts of a string schema fields',
    function (done) {
      Person
        .search(person.address.split(' ')[0], function (error, results) {

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

  it(
    'should be able to do case insensitive search using string schema fields',
    function (done) {
      Person
        .search(person.address.toUpperCase(), function (error, results) {

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

  it('should be able to search using single embedded subdocs fields',
    function (done) {
      Person
        .search(person.brother.name, function (error, results) {

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

  it('should be able to search using array if embedded subdocs fields',
    function (done) {
      Person
        .search(_.first(person.sisters).name, function (error, results) {

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

  it('should be able to search using single embedded subdoc nested fields',
    function (done) {
      Person
        .search(person.residence.street, function (error, results) {

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

  it('should be able to search using single embedded subdoc nested fields',
    function (done) {
      Person
        .search(person.residence.city.name, function (error, results) {

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

  it('should be able to search using single embedded subdoc nested fields',
    function (done) {
      Person
        .search(person.residence.city.country.name, function (error,
          results) {

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

  after(function (done) {
    Person.deleteMany(done);
  });

});