'use strict';

/**
 * @name searchable
 * @description mongoose plugin to regex search on schema searchable fields.
 * @param  {Schema} schema  valid mongoose schema
 * @return {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 *const PersonSchema = new Schema({
 *  name: {
 *     type: String,
 *     searchable: true // make field searchable
 *  }
 *});
 *
 *...
 *
 * //search and run query
 * Person.search(<queryString>, <fn>);
 *
 *
 * //search return query for futher chaining
 * let query = Person.search(<queryString>);
 */

//dependencies
const _ = require('lodash');


module.exports = exports = function (schema) {
  //collect searchable fields
  let searchables = [];

  //collect searchable path
  schema.eachPath(function (pathName, schemaType) {
    //TODO handle number schema types

    //collect searchable fields
    const isSearchable =
      _.get(schemaType.options, 'searchable');
    if (isSearchable) {
      searchables.push(pathName);
    }
  });


  /**
   * @name search
   * @description perform free text search using regex
   * @param  {String}   queryString query string
   * @param  {Function} [done] optional callback to invoke on success or 
   *                           failure        
   * @return {Query|[Object]}  query instance if callback not provided else
   *                           collection of model instance match specified
   *                           query string
   * @public
   */
  schema.statics.search = function (queryString, done) {

    //prepare search query
    let query = this.find();

    //prepare search criteria
    let criteria = { $or: [] };

    //iterate over searchable fields and build
    //search criteria
    _.forEach(searchables, function (searchable) {

      //collect searchable and build regex
      let fieldSearchCriteria = {};

      //prepare regex search to simulate SQL like query
      //with case ignored
      fieldSearchCriteria[searchable] =
        new RegExp(queryString + '$', 'i'); // lets use LIKE %

      criteria.$or.push(fieldSearchCriteria);

    });

    //ensure query critia on current query instance
    if (!_.isEmpty(queryString) && _.size(searchables) > 0) {
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
