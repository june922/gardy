const { Model } = require('objection');
const schema = require('./tenants.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class tenants extends Model {
    static get tableName() {
        return 'tenants';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = tenants;
