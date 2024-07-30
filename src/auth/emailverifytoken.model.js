const { Model } = require ('objection');
const { knex } = require ('../../config/db.config');
const schema = require ('./emailverifytoken.schema.json');
const config = require("../../config/auth.config");
const jwt = require('jsonwebtoken');

Model.knex(knex);

class emailverifytoken extends Model {
    static get tableName () {
        return 'emailverifytoken';
    }
    static get jsonSchema() {
        return schema;
    }
    static async createToken (user){
    const expiredAt = new Date ();
    const expirationTimeInSeconds = parseTimeToSeconds(config.jwtExpirationShort);
    expiredAt.setseconds(expiredAt.getSeconds() + expirationTimeInSeconds);
    const token = jwt.sign({ id: user.id}, config.secret,{ expiresIn: expirationTimeInSeconds});
    
    return token;
}

static verifyExpiration(token) {
    return token.expiry_date.getTime() < new Date().getTime();
}
static get relationMappings() {
    const user = require('../users/users.model');
    return{
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: user,
            join:{
                from: "emailverifytoken.user_id",
                to:'users.id'
            }
        }
    };
 }
}

function parseTimeToSeconds (timeString) {
    const units = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
        'w': 604800
    };

    const match = timeString.match(/^(\d+)([smhdw])$/);
    if(!match) {
        throw new Error('Invalid time string format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    if ((!unit in units)) {
        throw new Error ('Invalid time unit');
    
    }
    return value * units[unit];
}
module.exports = emailverifytoken;