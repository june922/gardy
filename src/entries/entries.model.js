const { Model } = require ('objection');
const Schema = require ('./entries.schema.json');
const { knex } = require ('../../config/db.config');
Model.knex(knex);

class entries extends Model {
    static get tableName () {
        return 'entries';
    }

    static get jsonSchema () {
        return Schema;

    }
}
module.exports = entries;