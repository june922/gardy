const { Model } = require('objection');
const schema = require('./estates.schema.json');
const { knex } = require('../../config/db.config')
const Town = require('../city/city.model');

Model.knex(knex);

class estates extends Model {
    static get tableName() {
        return 'estates';
    }

    static get jsonSchema() {
        return schema;
    }

    // relation to Town model
    static get relationMappings() {
        return {
            town: {
                relation: Model.BelongsToOneRelation,
                modelClass: Town,
                join: {
                    from: 'estates.town_id',
                    to: 'cities.id'
                }
            }
        };
    }
}

module.exports = estates;