const { Model } = require('objection');
const Schema = require('./entries.schema.json');
const { knex } = require('../../config/db.config');
Model.knex(knex);

const Users = require('../users/users.model');      // Adjust path if needed
const Vehicles = require('../Vehicles/vehicles.model');  // Adjust path if needed
const visitors = require('../visitors/visitors.model');  // Adjust path if needed

class entries extends Model {
  static get tableName() {
    return 'entries';
  }

  static get jsonSchema() {
    return Schema;
  }

  static get relationMappings() {
   
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'entries.user_id',
          to: 'users.id',
        },
      },
      vehicle: {
        relation: Model.BelongsToOneRelation,
        modelClass: Vehicles,
        join: {
          from: 'entries.vehicle_id',
          to: 'vehicles.id',
        },
      },
    
    visitors: {
      relation: Model.BelongsToOneRelation,
      modelClass: visitors,
      join: {
        from: 'entries.visitor_id',
        to: 'visitors.id',
      },
    },
  };
}}

module.exports = entries;
