'use strict';


/* dependencies */
const _ = require('lodash');
const { uniq } = require('@lykmapipo/common');
const {
  eachPath,
  isString,
  isStringArray
} = require('@lykmapipo/mongoose-common');


/**
 * @function collectSearchables
 * @name collectSearchables
 * @description collect schema searchable fields recursively.
 * @param {Schema} schema valid mongoose schema instance.
 * @return {String[]} set of all schema searchable paths.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.7.0
 * @version 0.1.0
 * @private
 * const searchables = collectSearchables(schema);
 * //=> [...]
 */
const collectSearchables = schema => {
  // searchable set
  let searchables = [];

  // collect searchable path
  const collectSearchablePath = (pathName, schemaType) => {
    // check if is string or array of string schema type
    const isStringSchema =
      (isString(schemaType) || isStringArray(schemaType));

    // check if path is searchable
    const isSearchable =
      (schemaType.options && schemaType.options.searchable);

    // collect if is searchable schema path
    if (isStringSchema && isSearchable) {
      searchables.push(pathName);
    }
  };

  // collect searchable schema paths
  eachPath(schema, collectSearchablePath);

  // return collect searchable schema paths
  searchables = uniq(searchables);
  return searchables;
};


/**
 * @name searchable
 * @description mongoose plugin to regex search on schema searchable fields.
 * @param {Schema} schema  valid mongoose schema
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/regex/}
 * @see {@link https://docs.mongodb.com/manual/reference/collation/}
 * @return {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const mongoose = require('mongoose');
 * const searchable = require('mongoose-regex-search');
 * const Schema = mongoose.Schema;
 * 
 * const UserSchema = new Schema({
 *  name: { type: String, searchable: true }
 * });
 * UserSchema.plugin(searchable);
 * const User = mongoose.model('User', UserSchema);
 *
 * //search and run query
 * User.search('john', (error, results) => { ... });
 * User.search('john', { $age: { $gte: 14 } }, (error, results) => { ... });
 *
 * //search return query for futher chaining
 * let query = User.search('john');
 * let query = User.search('john', { $age: { $gte: 14 } });
 */
const searchablePlugin = (schema, options) => {
  //merge options
  options = _.merge({}, options);

  // expose searchable fields as schema statics
  const searchables = collectSearchables(schema);
  schema.statics.SEARCHABLE_FIELDS = searchables;

  /**
   * @function search
   * @name search
   * @description perform free text search using regex
   * @param {String} queryString query string
   * @param {Function} [cb] optional callback to invoke on success or failure        
   * @return {Query|[Object]} query instance if callback not provided else 
   * collection of model instance match specified query string.
   * @public
   * @static
   * @since 0.1.0
   * @version 0.2.0
   * @example
   * User.search('john', (error, results) => { ... });
   * User.search('john'); //=> Query
   *
   * User.search('john', { age: { $gte: 14 } }, (error, results) => { ... });
   * User.search('john', { age: { $gte: 14 } }); //=> Query
   */
  schema.statics.search = function search(queryString, filter, cb) {
    // normalize arguments
    const filters = _.isFunction(filter) ? {} : _.merge({}, filter);
    const done = _.isFunction(filter) ? filter : cb;

    //prepare search query
    let query = this.find();

    //prepare search criteria
    let criteria = { $or: [] };

    //iterate over searchable fields and build
    //search criteria
    _.forEach(searchables, function (searchable) {

      //collect searchable and build regex
      let fieldSearchCriteria = {};

      //prepare regex search on string to simulate SQL like query
      //with case ignored
      fieldSearchCriteria[searchable] = {
        //see https://docs.mongodb.com/manual/reference/sql-comparison/
        $regex: new RegExp(queryString), // lets use LIKE %queryString%
        $options: 'i' //perform case insensitive search
      };
      criteria.$or.push(fieldSearchCriteria);

    });

    //ensure query critia on current query instance
    if (queryString && _.size(searchables) > 0) {
      // $and filters if available
      if (!_.isEmpty(filters)) {
        criteria = { $and: [filters, criteria] };
      }
      query = query.find(criteria);
    }

    //execute query if done callback specified
    if (done && _.isFunction(done)) {
      return query.exec(done);
    }
    //return query
    else {
      return query;
    }

  };

};


/* expose mongoose searchable plugin */
module.exports = exports = searchablePlugin;