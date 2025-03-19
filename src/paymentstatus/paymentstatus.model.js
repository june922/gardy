const { Model } = require('objection');
const schema = require('./paymentstatus.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class Status extends Model {
    static get tableName() {
        return 'paymentstatus';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = Status;
