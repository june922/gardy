const { Model } = require('objection');
const schema = require('./city.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class City extends Model {
    static get tableName() {
        return 'cities';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = City;
