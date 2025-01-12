const { Model } = require('objection');
const schema = require('./visitortypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class visitortypes extends Model {
    static get tableName() {
        return 'visitortypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = visitortypes;
