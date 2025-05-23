const { Model } = require('objection');
const schema = require('./entrytypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class entrytypes extends Model {
    static get tableName() {
        return 'entrytypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = entrytypes;
