const { Model } = require('objection');
const schema = require('./subscriptions.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class Subscriptions extends Model {
    static get tableName() {
        return 'subscriptions';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = Subscriptions;
