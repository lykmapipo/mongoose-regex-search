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
    type: String,
    index: true,
    searchable: true
  }
});
const Person = mongoose.model('Person', PersonSchema);

describe('mongoose-regex-searchable', function () {

  let person = {
    name: faker.company.companyName()
  };

  before(function (done) {
    Person.create(person, function (error, created) {
      person = created;
      done(error, created);
    });
  });

  it('should be able to search', function (done) {
    Person
      .search(person.name, function (error, results) {

        expect(error).to.not.exist;
        expect(results).to.exist;
        expect(results).to.have.length.above(0);

        //assert single result
        const found = results[0];
        expect(found.name).to.exist;

        expect(found.name).to.equal(person.name);

        done(error, results);

      });
  });

  after(function (done) {
    Person.remove(done);
  });

});
