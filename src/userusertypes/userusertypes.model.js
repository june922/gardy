const { Model } = require('objection');
const schema = require('./userusertypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class userusertypes extends Model {
    static get tableName() {
        return 'userusertypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = userusertypes;
