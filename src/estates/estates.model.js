const { Model } = require('objection');
const schema = require('./estates.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class estates extends Model {
    static get tableName() {
        return 'estates';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = estates;
