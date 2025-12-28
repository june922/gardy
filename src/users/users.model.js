const { Model } = require('objection');
const Schema = require('./users.schema.json');
const { knex } = require('../../config/db.config');
Model.knex(knex);

class users extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return Schema;
    }

    static get relationMappings() {
        return {
            // User Types relationship
            user_types: {
                relation: Model.ManyToManyRelation,
                modelClass: require('../usertypes/usertypes.model'),
                join: {
                    from: 'users.id',
                    through: {
                        // Try different possible column names
                        from: 'userusertypes.user_id',
                        to: 'userusertypes.user_type_id'
                    },
                    to: 'usertypes.id'
                }
            },
            
            // User Roles relationship  
            user_roles: {
                relation: Model.ManyToManyRelation,
                modelClass: require('../userroles/userroles.model'),
                join: {
                    from: 'users.id',
                    through: {
                        // Try different possible column names
                        from: 'useruserroles.user_id',
                        to: 'useruserroles.user_role_id'
                    },
                    to: 'userroles.id'
                }
            },
            
            // Tenant relationship (if user is a tenant)
            tenant: {
                relation: Model.HasOneRelation,
                modelClass: require('../tenants/tenants.model'),
                join: {
                    from: 'users.id',
                    to: 'tenants.user_id'
                }
            },
            
            // Employee relationship (if user is an employee)
            employee: {
                relation: Model.HasOneRelation,
                modelClass: require('../employees/employees.model'),
                join: {
                    from: 'users.id',
                    to: 'employees.user_id'
                }
            }
        };
    }
    
    // Add a method to debug relationships
    static async debugUser(id) {
        const user = await this.query().findById(id);
        
        if (!user) {
            console.log(`User ${id} not found`);
            return null;
        }
        
        console.log(`\n🔍 Debugging User ${id}: ${user.first_name} ${user.last_name}`);
        
        try {
            // Try to fetch relationships directly
            const userTypes = await knex('userusertypes')
                .where('user_id', id)
                .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
                .select('usertypes.*');
            
            console.log(`Raw user types query:`, userTypes);
            
            const userRoles = await knex('useruserroles')
                .where('user_id', id)
                .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
                .select('userroles.*');
            
            console.log(`Raw user roles query:`, userRoles);
            
            // Now try with objection
            const withRelations = await this.query()
                .findById(id)
                .withGraphFetched('[user_types, user_roles]');
            
            console.log(`Objection user types:`, withRelations.user_types);
            console.log(`Objection user roles:`, withRelations.user_roles);
            
            return withRelations;
        } catch (error) {
            console.error(`Debug error:`, error.message);
            return null;
        }
    }
}

module.exports = users;