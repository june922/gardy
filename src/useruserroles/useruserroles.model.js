const { Model } = require('objection');
const schema = require('./useruserroles.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class useruserroles extends Model {
    static get tableName() {
        return 'useruserroles';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = useruserroles;
