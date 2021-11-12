import _ from 'lodash';
import { Schema, createModel } from '@lykmapipo/mongoose-common';
import { expect, faker } from '@lykmapipo/mongoose-test-helpers';
import searchable from '../src';

// TODO add searchable doc and index it to support refs

// sub schema definition
const Relative = new Schema({
  name: {
    type: String,
    searchable: true,
  },
});

const Country = new Schema({
  name: {
    type: String,
    searchable: true,
  },
});

const City = new Schema({
  name: {
    type: String,
    searchable: true,
  },
  country: Country,
});

// nested
const Residence = new Schema({
  street: {
    type: String,
    searchable: true,
  },
  city: City,
});

// prepare schema
const PersonSchema = {
  age: {
    type: Number,
    index: true,
    searchable: true,
  },
  name: {
    firstName: {
      type: String,
      index: true,
      searchable: true,
    },
    surname: {
      type: String,
      index: true,
      searchable: true,
    },
  },
  contacts: [
    {
      // TODO
      form: {
        type: String,
        default: 'Phone',
        index: true,
        searchable: true,
      },
      value: {
        type: String,
        index: true,
        searchable: true,
      },
    },
  ],
  address: {
    type: String,
    index: true,
    searchable: true,
  },
  titles: {
    type: [String],
    index: true,
    searchable: true,
  },
  scores: {
    type: [Number],
    index: true,
    searchable: true,
  },
  brother: Relative,
  aunt: { type: Relative },
  sisters: { type: [Relative] },
  friends: [Relative],
  residence: Residence,
};
const Person = createModel(PersonSchema, { modelName: 'Person' }, searchable);

describe('internals', () => {
  let person = {
    age: faker.datatype.number({ min: 20, max: 45 }),
    name: {
      firstName: faker.name.firstName(),
      surname: faker.name.lastName(),
    },
    address: faker.address.streetAddress(),
    titles: [faker.name.jobTitle(), faker.name.jobTitle()],
    scores: [
      faker.datatype.number({ min: 20, max: 45 }),
      faker.datatype.number({ min: 20, max: 45 }),
    ],
    brother: { name: faker.name.findName() },
    aunt: { name: faker.name.findName() },
    sisters: [{ name: faker.name.findName() }, { name: faker.name.findName() }],
    friends: [{ name: faker.name.findName() }, { name: faker.name.findName() }],
    residence: {
      // nested
      street: faker.address.streetName(),
      city: {
        name: faker.address.city(),
        country: {
          name: faker.address.country(),
        },
      },
    },
  };

  before((done) => {
    Person.deleteMany(done);
  });

  before((done) => {
    Person.create(person, (error, created) => {
      person = created;
      done(error, created);
    });
  });

  it('should to navigate paths and build searchable fields', () => {
    expect(Person.SEARCHABLE_FIELDS).to.exist;
    expect(Person.SEARCHABLE_FIELDS).to.be.an('array');
    expect(Person.SEARCHABLE_FIELDS).to.have.length(13);

    // assert searchable fields
    expect(Person.SEARCHABLE_FIELDS).to.not.contain('age');
    expect(Person.SEARCHABLE_FIELDS).to.contain('name.firstName');
    expect(Person.SEARCHABLE_FIELDS).to.contain('name.surname');
    expect(Person.SEARCHABLE_FIELDS).to.contain('contacts.form');
    expect(Person.SEARCHABLE_FIELDS).to.contain('contacts.value');
    expect(Person.SEARCHABLE_FIELDS).to.contain('address');
    expect(Person.SEARCHABLE_FIELDS).to.contain('titles');
    expect(Person.SEARCHABLE_FIELDS).to.not.contain('scores');
    expect(Person.SEARCHABLE_FIELDS).to.contain('brother.name');
    expect(Person.SEARCHABLE_FIELDS).to.contain('aunt.name');
    expect(Person.SEARCHABLE_FIELDS).to.contain('sisters.name');
    expect(Person.SEARCHABLE_FIELDS).to.contain('friends.name');
    expect(Person.SEARCHABLE_FIELDS).to.contain('residence.street');
    expect(Person.SEARCHABLE_FIELDS).to.contain('residence.city.name');
    expect(Person.SEARCHABLE_FIELDS).to.contain('residence.city.country.name');
  });

  it('should search using string schema fields', (done) => {
    const q = person.address;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using parts of a string schema fields', (done) => {
    const q = _.first(person.address.split(' '));
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using parts of a string schema fields', (done) => {
    const q = _.upperFirst(_.last(person.address.split(' ')));
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should do case insensitive search using string schema fields', (done) => {
    const q = person.address.toUpperCase();
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should do case insensitive search using part of a string schema fields', (done) => {
    const q = person.name.firstName.split(' ')[0].toUpperCase();
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using single embedded subdocs fields', (done) => {
    const q = person.firstName;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using single embedded subdocs fields', (done) => {
    const q = person.brother.name;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using array of string schema fields', (done) => {
    const q = person.titles[0];
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);
      expect(found.titles).to.include.members(person.titles);

      done(error, results);
    });
  });

  it('should search using array if embedded subdocs fields', (done) => {
    const q = _.first(person.sisters).name;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using single embedded subdoc nested fields', (done) => {
    const q = person.residence.street;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using single embedded subdoc nested fields', (done) => {
    const q = person.residence.city.name;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should search using single embedded subdoc nested fields', (done) => {
    const q = person.residence.city.country.name;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should filter and search using schema fields', (done) => {
    const q = person.address;
    Person.search(q, { age: { $eq: person.age } }, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  it('should filter and search using schema fields', (done) => {
    const q = faker.name.findName();
    Person.search(q, { age: { $eq: person.age } }, (error, results) => {
      expect(error).to.not.exist;
      expect(results.length).to.be.equal(0);
      done(error, results);
    });
  });

  it('should ignore search with null query string', (done) => {
    const q = null;
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.have.length.above(0);
      done(error, results);
    });
  });

  it('should ignore search with empty query string', (done) => {
    const q = ' ';
    Person.search(q, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.have.length.above(0);
      done(error, results);
    });
  });

  it('should ignore search with undefined query string', (done) => {
    Person.search(undefined, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.have.length.above(0);
      done(error, results);
    });
  });

  it('should filter and search with falsey query string', (done) => {
    const filter = { age: { $eq: person.age } };
    Person.search(undefined, filter, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results).to.have.length.above(0);

      // assert single result
      const found = results[0];
      expect(found.address).to.exist;

      expect(found.name.firstName).to.equal(person.name.firstName);
      expect(found.name.lastName).to.equal(person.name.lastName);
      expect(found.address).to.equal(person.address);

      done(error, results);
    });
  });

  after((done) => {
    Person.deleteMany(done);
  });
});
