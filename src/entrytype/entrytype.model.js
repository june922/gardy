const { Model } = require('objection');
const schema = require('./entrytype.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class entrytype extends Model {
    static get tableName() {
        return 'entrytype';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = entrytype;
