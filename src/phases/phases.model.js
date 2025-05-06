const { Model } = require('objection');
const schema = require('./phases.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class phases extends Model {
    static get tableName() {
        return 'phases';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = phases;
