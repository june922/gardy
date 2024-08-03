const { Model } = require ('objection');
const Schema = require ('./visitortypes.schema.json');
const { knex } = require ( '../../config/db.config');
Model.knex (knex);
 
class visitortypes extends Model {
    static get tableName () {
        return 'visitortypes';

    }

    static get jsonSchema () {
        return  Schema;
    }
}

module.exports = visitortypes;