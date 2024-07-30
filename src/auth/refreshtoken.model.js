const {Model} = require ('objection')
const { v4: uuidv4 } = require("uuid");
const schema = require('./refreshtoken.schema.json');
const { knex } = require('../../config/db.config.js');
const config = require ("../../config/auth.config.js");

Model.knex(knex);

class refreshtoken extends Model {
    static get tableName() {
        return 'refreshtoken';
    }
    static get jsonSchema() {
        return schema;
    }
static async createToken(user) {
    const expiredAt = new Date ();
    expiredAt.setSeconds (expiredAt.getSeconds() + config.jwtRefreshExpiration);
    const token = uuidv4 ();

    const refreshToken = await refreshtoken.query().insert({
        refresh_token:token,
        user_id : parseInt(user.id),
        expiry_date:expiredAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date ().toISOString()   
    });
    //console.log(refreshToken.refresh_token)

    return refreshToken.refresh_token;
}

static verifyExpiration(token) {
    return token.expiry_date.getTime() < new Date().getTime();
}

static get relationMappings() {
    const User = require('../users/users.model.js');

    return {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: 'refreshtoken.user_id',
                to: 'users.id'
            }
        }
    };
}
}

module.exports = refreshtoken;
