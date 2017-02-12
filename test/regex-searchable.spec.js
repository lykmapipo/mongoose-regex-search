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
  address: {
    type: String,
    index: true,
    searchable: true
  }
});
const Person = mongoose.model('Person', PersonSchema);

describe('mongoose-regex-searchable', function () {

  let person = {
    name: {
      firstName: faker.name.firstName(),
      surname: faker.name.lastName()
    },
    address: faker.address.streetAddress()
  };

  before(function (done) {
    Person.create(person, function (error, created) {
      person = created;
      done(error, created);
    });
  });

  it('should be able to search using direct schema fields', function (done) {
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

  after(function (done) {
    Person.remove(done);
  });

});
