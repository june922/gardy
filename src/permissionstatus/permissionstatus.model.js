const { Model } = require('objection');
const schema = require('./permissionstatus.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class permissionStatus extends Model {
    static get tableName() {
        return 'permission_status';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = permissionStatus;
