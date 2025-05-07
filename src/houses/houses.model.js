const { Model } = require('objection');
const phases = require('../phases/phases.model');
const estates = require('../estates/estates.model');
const blocks = require('../blocks/blocks.model');
const schema = require('./houses.schema.json');
const { knex } = require('../../config/db.config')
Model.knex(knex);


class houses extends Model {
    static get tableName() {
        return 'houses';
    }

    static get jsonSchema() {
        return schema;
    }

}

module.exports = houses;
