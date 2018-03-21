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
 * const PersonSchema = new Schema({
 *  address: {
 *     type: String,
 *     searchable: true // make field searchable
 *  }
 * });
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


module.exports = exports = function (schema, options) {

  //merge options
  options = _.merge({}, { delta: 0.1 }, options);

  //collect searchable fields
  let searchables = [];

  //collect searchable which are numbers
  let numbers = [];

  /**
   * @name  collectSearchablePath
   * @description iterate recursively on schema paths and collect searchable
   *              paths only
   * @param  {String} pathName   [description]
   * @param  {SchemaType} schemaType [description]
   * @param  {String} parentPath [description]
   * @since  0.3.0
   * @version 0.1.0
   * @private
   */
  function collectSearchablePaths(pathName, schemaType, parentPath) {

    //TODO handle refs(ObjectId) schema type

    //update path name
    pathName = _.compact([parentPath, pathName]).join('.');

    //start handle sub schemas
    const isSchema =
      schemaType.schema && schemaType.schema.eachPath &&
      _.isFunction(schemaType.schema.eachPath);
    if (isSchema) {
      schemaType.schema.eachPath(function (_pathName, _schemaType) {
        collectSearchablePaths(_pathName, _schemaType, pathName);
      });
    }

    //check if schematype is searchable
    const isSearchable =
      _.get(schemaType.options, 'searchable');

    //check if schema instance is number
    const isNumber =
      _.get(schemaType, 'instance') === 'Number' ||
      _.get(schemaType, 'caster.instance') === 'Number';

    //collect searchable fields
    if (isSearchable) {

      //collect searchable fields
      searchables.push(pathName);

      //collect number fields
      if (isNumber) {
        numbers.push(pathName);
      }

    }

  }

  //collect searchable path
  schema.eachPath(function (pathName, schemaType) {
    collectSearchablePaths(pathName, schemaType);
  });

  //expose searchable fields as schema statics
  schema.statics.SEARCHABLE_FIELDS = _.compact(searchables);

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

    //check if query string is a number
    const isNumberQueryString = _.isNumber(queryString);

    //prepare search query
    let query = this.find();

    //prepare search criteria
    let criteria = { $or: [] };

    //iterate over searchable fields and build
    //search criteria
    _.forEach(searchables, function (searchable) {

      //collect searchable and build regex
      let fieldSearchCriteria = {};

      //check if searchable field is a number
      const isNumberSearchable = _.indexOf(numbers, searchable) >= 0;

      //prepare regex search on string to simulate SQL like query
      //with case ignored
      if (!isNumberSearchable) {
        fieldSearchCriteria[searchable] = {
          //see https://docs.mongodb.com/manual/reference/sql-comparison/
          $regex: new RegExp(queryString), // lets use LIKE %queryString%
          $options: 'i' //perform case insensitive search
        };
        criteria.$or.push(fieldSearchCriteria);
      }

      //prepare fake regex search on number fields
      if (isNumberSearchable && isNumberQueryString) {
        fieldSearchCriteria[searchable] = {
          $gt: queryString - options.delta,
          $lte: queryString + options.delta
        };
        criteria.$or.push(fieldSearchCriteria);
      }

    });

    //ensure query critia on current query instance
    if (queryString && _.size(searchables) > 0) {
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