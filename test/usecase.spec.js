'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { clear, expect } = require('@lykmapipo/mongoose-test-helpers');
const searchable = require(path.join(__dirname, '..'));


/* prepare schema */
const UseCaseSchema = new Schema({
  content: { type: String, index: true, searchable: true }
});
UseCaseSchema.plugin(searchable);
const UseCase = mongoose.model('UseCase', UseCaseSchema);


/* test */
const check = (error, results, usecase, done) => {
  expect(error).to.not.exist;
  expect(results).to.exist;
  expect(results).to.have.length.above(0);

  //assert single result
  const found = results[0];
  expect(found.content).to.equal(usecase.content);

  done(error, results);
};


/* use cases */
const usecases = [{
  scenario: 'search on field start with cap',
  title: 'should work',
  content: 'Earth',
  q: 'ea',
  test: check
}, {
  scenario: 'search on uppercase fields',
  title: 'should work',
  content: 'EARTH',
  q: 'ea',
  test: check
}, {
  scenario: 'search on uppercase fields',
  title: 'should work',
  content: 'EARTH',
  q: 'EA',
  test: check
}];


_.forEach(usecases, (usecase) => {

  // derive usecase
  const { scenario, title, content, q, test } = usecase;
  describe(`${scenario}`, () => {

    // clear
    before(done => clear(done));

    // setup test data
    before((done) => {
      UseCase.create({ content }, done);
    });

    // use case driver
    it(`${title}`, (done) => {
      UseCase.search(q, (error, results) => {
        test(error, results, usecase, done);
      });
    });

    // clear
    after(done => clear(done));

  });

});