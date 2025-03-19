const { Model } = require('objection');
const schema = require('./payments.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class Payments extends Model {
    static get tableName() {
        return 'payments';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = Payments;
