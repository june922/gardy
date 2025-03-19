const { Model } = require('objection');
const Schema = require('./permissiontypes.schema.json');
const { knex } = require('../../config/db.config');
Model.knex(knex);


class permissiontypes extends Model {
    static get tableName() {
        return 'permissiontypes';
    }

    static get jsonSchema() {
        return Schema;
    }

}

module.exports = permissiontypes;
