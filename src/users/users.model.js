const { Model } = require ('objection');
const Schema = require ('./users.schema.json');
const { knex } = require ('../../config/db.config')
Model.knex(knex);


class users extends Model{
    static get tableName () {
        return 'users';

    }

    static get jsonSchema () {
        return Schema;
    }

}
module.exports = users;

