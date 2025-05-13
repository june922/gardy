const { Model } = require('objection');
const schema = require('./employees.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class employees extends Model {
    static get tableName() {
        return 'employees';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = employees;
