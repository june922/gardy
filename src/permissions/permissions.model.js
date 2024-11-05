const { Model } = require('objection');
const schema = require('./permissions.schema.json');
const { knex } = require('../../config/db.config')
const Vehicle = require('../Vehicle/vehicles.model');
const permissionStatus = require('../permissionstatus/permissionstatus.model');
const category = require ('../category/category.model');
const permissiontypes = require('../permissiontypes/permissiontypes.model');



Model.knex(knex);


class permissions extends Model {
    static get tableName() {
        return 'permissions';
    }

    static get jsonSchema() {
        return schema;
    }

    /// In Permission model

static get relationMappings() {

    
    return {
        vehicle: {
            relation: Model.BelongsToOneRelation,
            modelClass: Vehicle,
            join: {
                from: 'permissions.vehicle_id',
                to: 'vehicles.id'
            }
        },
        permissionStatus: {
            relation: Model.BelongsToOneRelation,
            modelClass: permissionStatus,
            join: {
                from: 'permissions.permission_status_id',
                to: 'permission_status.id'
            }
        }, 
        category: {
            relation: Model.BelongsToOneRelation,
            modelClass: category,
            join: {
                from: 'permissions.category_id',
                to: 'category.id'
        }
    },
       permissiontypes: {
            relation: Model.BelongsToOneRelation,
            modelClass: permissiontypes,
            join: {
                from: 'permissions.permission_type_id',
                to: 'permissiontypes.id'
            }
       }

    };
}


}




module.exports = permissions;
