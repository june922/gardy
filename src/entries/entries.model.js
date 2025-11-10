// entries.model.js
const { Model } = require('objection');

class Entry extends Model {
  static get tableName() {
    return 'entries';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['check_in'], // Only check_in is truly required
      properties: {
        id: { type: 'integer' },
        entry_type_id: { type: 'integer' },
        visitor_type_id: { type: ['integer', 'null'] },
        tenant_id: { type: ['integer', 'null'] },
        vehicle_details: { 
          type: ['object', 'null'],
          properties: {
            description: { type: 'string' },
            make: { type: 'string' },
            model: { type: 'string' },
            color: { type: 'string' },
            number_plate: { type: 'string' }
          }
        },
        house_id: { type: 'integer' },
        checked_in_by: { type: ['integer', 'null'] },
        check_in: { type: 'string', format: 'date-time' },
        check_out: { type: ['string', 'null'], format: 'date-time' },
        checked_out_by: { type: ['integer', 'null'] },
        remarks: { type: ['string', 'null'] }, // ✅ FIXED: Allow both string and null
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        national_id: { type: ['string', 'null'] },
        phone_number: { type: 'string' },
        number_of_people: { type: ['integer', 'null'] }
      }
    };
  }
}

module.exports = Entry; 
 
 
 
 // FAITH const { Model } = require('objection');
// const Schema = require('./entries.schema.json');
// const { knex } = require('../../config/db.config');
// Model.knex(knex);

// const Users = require('../users/users.model');      // Adjust path if needed
// const Vehicles = require('../Vehicles/vehicles.model');  // Adjust path if needed
// const visitors = require('../visitors/visitors.model');  // Adjust path if needed

// class entries extends Model {
//   static get tableName() {
//     return 'entries';
//   }

//   static get jsonSchema() {
//     return Schema;
//   }

//   static get relationMappings() {
   
//     return {
//       user: {
//         relation: Model.BelongsToOneRelation,
//         modelClass: Users,
//         join: {
//           from: 'entries.user_id',
//           to: 'users.id',
//         },
//       },
//       vehicle: {
//         relation: Model.BelongsToOneRelation,
//         modelClass: Vehicles,
//         join: {
//           from: 'entries.vehicle_id',
//           to: 'vehicles.id',
//         },
//       },
    
//     visitors: {
//       relation: Model.BelongsToOneRelation,
//       modelClass: visitors,
//       join: {
//         from: 'entries.visitor_id',
//         to: 'visitors.id',
//       },
//     },
//   };
// }}

// module.exports = entries;
