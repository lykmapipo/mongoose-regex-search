# mongoose-regex-search

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-regex-search.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-regex-search)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-regex-search/status.svg)](https://david-dm.org/lykmapipo/mongoose-regex-search)
[![npm version](https://badge.fury.io/js/mongoose-regex-search.svg)](https://badge.fury.io/js/mongoose-regex-search)

mongoose plugin to regex search on schema searchable fields. 

It support regex search in `string schema fields`, `array of strings`, `single embeded doc string fields` and `array embeded doc string fields` with `searchable: true` option.

## Requirements

- NodeJS v6.5+

## Install
```sh
$ npm install --save mongoose-regex-search
```

## Usage

```js
const mongoose = require('mongoose');
const searchable = require('mongoose-regex-search');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, searchable: true }
    age: { type: Number }
});
UserSchema.plugin(searchable);
const User = mongoose.model('User', UserSchema);

// search and run query
User.search('john', (error, results) => { ... });
User.search('john', { $age: { $gte: 14 } }, (error, results) => { ... });

// search return query for futher chaining
let query = User.search('john');
let query = User.search('john', { $age: { $gte: 14 } });
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