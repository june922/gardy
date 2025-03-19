const { Model } = require('objection');
const schema = require('./notifications.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class Notifications extends Model {
    static get tableName() {
        return 'notification';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = Notifications;
