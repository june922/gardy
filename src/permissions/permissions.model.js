const { Model } = require('objection');
const schema = require('./permissions.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class permissions extends Model {
    static get tableName() {
        return 'permissions';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = permissions;
