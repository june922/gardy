const { Model } = require('objection');
const schema = require('./userroles.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class userroles extends Model {
    static get tableName() {
        return 'userroles';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = userroles;
