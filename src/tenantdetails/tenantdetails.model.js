const { Model } = require('objection');
const schema = require('./tenantdetails.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class tenantdetails extends Model {
    static get tableName() {
        return 'tenantdetails';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = tenantdetails;
