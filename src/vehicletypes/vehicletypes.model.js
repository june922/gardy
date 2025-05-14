const { Model } = require('objection');
const schema = require('./vehicletypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class vehicletypes extends Model {
    static get tableName() {
        return 'vehicletypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = vehicletypes;
