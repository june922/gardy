const { Model } = require('objection');
const schema = require('./statuses.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class statuses extends Model {
    static get tableName() {
        return 'statuses';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = statuses;
