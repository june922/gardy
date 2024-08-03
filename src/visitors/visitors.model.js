const { Model } = require ('objection');
const Schema = require ('./visitors.schema.json');
const { knex } = require ('../../config/db.config')
Model.knex (knex);

class visitors extends Model{
    static get tableName () {
        return 'visitors';

    }

    static get jsonSchema () {
        return Schema;
    }

}
module.exports = visitors;

