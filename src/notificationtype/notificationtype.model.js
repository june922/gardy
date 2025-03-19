const { Model } = require('objection');
const schema = require('./notificationtype.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class NotificationType extends Model {
    static get tableName() {
        return 'notification_type';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = NotificationType;
