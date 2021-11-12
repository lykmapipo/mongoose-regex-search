'use strict';

const _ = require('lodash');
const common = require('@lykmapipo/common');
const mongooseCommon = require('@lykmapipo/mongoose-common');

/**
 * @function collectSearchables
 * @name collectSearchables
 * @description collect schema searchable fields recursively.
 * @param {object} schema valid mongoose schema instance.
 * @returns {string[]} set of all schema searchable paths.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.7.0
 * @version 0.1.0
 * @private
 * @example
 * const searchables = collectSearchables(schema);
 * //=> [...]
 */
const collectSearchables = (schema) => {
  // searchable set
  let searchables = [];

  // collect searchable path
  const collectSearchablePath = (pathName, schemaType) => {
    // check if is string or array of string schema type
    const isStringSchema = mongooseCommon.isString(schemaType) || mongooseCommon.isStringArray(schemaType);

    // check if path is searchable
    const isSearchable = schemaType.options && schemaType.options.searchable;

    // collect if is searchable schema path
    if (isStringSchema && isSearchable) {
      searchables.push(pathName);
    }
  };

  // collect searchable schema paths
  mongooseCommon.eachPath(schema, collectSearchablePath);

  // return collect searchable schema paths
  searchables = common.uniq(searchables);
  return searchables;
};

/**
 * @function buildSearchCriteria
 * @name buildSearchCriteria
 * @description build search criteria from searchable schema paths.
 * @param {string} queryString search term.
 * @param {object[]} searchables valid searchable paths
 * @returns {string[]} set of schema searchable paths.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.7.0
 * @version 0.1.0
 * @private
 * @example
 * const criteria = buildSearchCriteria(queryString, searchables);
 * //=> { $or: [...] }
 */
const buildSearchCriteria = (queryString, searchables) => {
  // prepare search criteria
  const criteria = {};

  // check if there is query string and searchable paths
  const searchTerm = String(_.trim(queryString));
  const canSearch = !_.isEmpty(searchTerm) && !_.isEmpty(searchables);

  // prepara search criteria
  if (canSearch) {
    // iterate over searchable paths and build search criteria
    _.forEach(searchables, (searchable) => {
      // initialize path search criteria
      const pathSearchCriteria = {};

      // prepare regex search on string to simulate SQL like query
      // with case ignored
      pathSearchCriteria[searchable] = {
        // see https://docs.mongodb.com/manual/reference/sql-comparison/
        $regex: new RegExp(searchTerm), // lets use LIKE %queryString%
        $options: 'i', // perform case insensitive search
      };

      // collect path search criteria
      if (criteria.$or) {
        criteria.$or.push(pathSearchCriteria);
      } else {
        criteria.$or = [pathSearchCriteria];
      }
    });
  }

  // return builded search criteria
  return criteria;
};

/**
 * @function searchable
 * @name searchable
 * @description mongoose plugin to regex search on schema searchable fields.
 * @param {object} schema valid mongoose schema
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/regex/}
 * @see {@link https://docs.mongodb.com/manual/reference/collation/}
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/and/}
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/or/}
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @example
 * import mongoose from 'mongoose';
 * import searchable from 'mongoose-regex-search';
 *
 * const UserSchema = new mongoose.Schema({
 *  name: { type: String, searchable: true },
 *  age: { type: Number }
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
const searchablePlugin = (schema) => {
  // expose searchable fields as schema statics
  const searchables = collectSearchables(schema);
  // eslint-disable-next-line no-param-reassign
  schema.statics.SEARCHABLE_FIELDS = searchables;

  /**
   * @function search
   * @name search
   * @description perform free text search using regex
   * @param {string} queryString query string
   * @param {object} filter additional query conditions
   * @param {Function} [cb] callback to invoke on success or failure
   * @returns {object | object[]} query instance if callback not provided else
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
  // eslint-disable-next-line no-param-reassign
  schema.statics.search = function search(queryString, filter, cb) {
    // normalize arguments
    const filters = _.isFunction(filter) ? {} : _.merge({}, filter);
    const done = _.isFunction(filter) ? filter : cb;

    // prepare search criteria
    const criteria = buildSearchCriteria(queryString, searchables);

    // chain criteria and provided filter
    let conditions = [];

    // cast filter
    if (!_.isEmpty(filters)) {
      try {
        const $filters = this.where(filters).cast(this);
        conditions.push($filters);
      } catch (error) {
        return done(error);
      }
    }

    // cast search criteria
    if (!_.isEmpty(criteria)) {
      try {
        const $criteria = this.where(criteria).cast(this);
        conditions.push($criteria);
      } catch (error) {
        return done(error);
      }
    }

    // create short-circuited end query
    conditions =
      conditions.length > 1 ? { $and: conditions } : _.first(conditions);

    // prepare search query
    let query = this.find();

    // ensure query conditions on current query instance
    if (conditions) {
      query = query.find(conditions);
    }

    // execute query if done callback specified
    if (done && _.isFunction(done)) {
      return query.exec(done);
    }

    // return query for chaining

    return query;
  };
};

module.exports = searchablePlugin;
