const { Model } = require('objection');
const schema = require('./checkintypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class checkintypes extends Model {
    static get tableName() {
        return 'checkintypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = checkintypes;
