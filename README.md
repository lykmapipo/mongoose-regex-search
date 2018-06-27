# mongoose-regex-search

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-regex-search.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-regex-search)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-regex-search/status.svg)](https://david-dm.org/lykmapipo/mongoose-regex-search)
[![npm version](https://badge.fury.io/js/mongoose-regex-search.svg)](https://badge.fury.io/js/mongoose-regex-search)

mongoose plugin to regex search on schema searchable fields. 

It support regex search in `primitives schema fields`, `array of primitives`, `single embeded doc fields` and `array embeded doc fields`.

**Note!: indexing searchable fields is highly advice to improve search performance. This is left to your system specifics for query optimization.**

## Requirements

- NodeJS v6.5+

## Install
```sh
$ npm install --save mongoose mongoose-regex-search
```

## Usage

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//apply mongoose-regex-search plugin to mongoose
mongoose.plugin(require('mongoose-regex-search'));

...

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

...

//search and run query
Person.search(<queryString>, <fn>);


//search return query for futher chaining
let query = Person.search(<queryString>);

```

## References
- [mongodb regex](https://docs.mongodb.com/manual/reference/operator/query/regex/)


## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 