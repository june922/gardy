const { Model } = require('objection');
const schema = require('./secondarytenant.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class secondarytenant extends Model {
    static get tableName() {
        return 'secondarytenants';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = secondarytenant;
