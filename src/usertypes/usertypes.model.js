const { Model } = require('objection');
const schema = require('./usertypes.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class usertypes extends Model {
    static get tableName() {
        return 'usertypes';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = usertypes;
