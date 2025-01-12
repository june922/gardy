const { Model } = require('objection');
const schema = require('./tenant.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class tenant extends Model {
    static get tableName() {
        return 'tenant';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = tenant;
