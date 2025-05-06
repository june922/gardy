const { Model } = require('objection');
const schema = require('./blocks.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class blocks extends Model {
    static get tableName() {
        return 'blocks';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = blocks;
