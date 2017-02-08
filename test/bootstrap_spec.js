'use strict';

//set environment to test
process.env.NODE_ENV = 'test';

//dependencies
const async = require('async');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//enable mongoose query debug(log)
// mongoose.set('debug', true);

/**
 * @description wipe all mongoose model data and drop all indexes
 */
function wipe(done) {
  var cleanups = mongoose.modelNames()
    .map(function (modelName) {
      //grab mongoose model
      return mongoose.model(modelName);
    })
    .map(function (Model) {
      return async.series.bind(null, [
        //clean up all model data
        Model.remove.bind(Model),
        //drop all indexes
        Model.collection.dropAllIndexes.bind(Model.collection)
      ]);
    });

  //run all clean ups parallel
  async.parallel(cleanups, function (error) {
    if (error && error.message !== 'ns not found') {
      done(error);
    } else {
      done(null);
    }
  });
}

//setup database
before(function (done) {
  mongoose.connect('mongodb://localhost/mongoose-regex-searchable', done);
});

// restore initial environment
after(function (done) {
  wipe(done);
});
