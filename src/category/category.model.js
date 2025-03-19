const { Model } = require('objection');
const schema = require('./category.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class category extends Model {
    static get tableName() {
        return 'category';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = category;
