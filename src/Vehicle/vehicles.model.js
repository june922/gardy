const { Model } = require ('objection');
const Schema = require ('./vehicles.schema.json');
const { knex } = require ( '../../config/db.config');
Model.knex (knex);
 
class vehicles extends Model {
    static get tableName () {
        return 'vehicles';

    }

    static get jsonSchema () {
        return  Schema;
    }
}

module.exports = vehicles;