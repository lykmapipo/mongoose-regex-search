'use strict';


process.env.NODE_ENV = 'test';

const { connect, drop } = require('@lykmapipo/mongoose-test-helpers');

before(done => connect(done));

after(done => drop(done));