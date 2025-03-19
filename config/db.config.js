const Knex = require('knex');
const knexConfig = require('../knexfile');
const knex = Knex(knexConfig.development);

// knex.raw('SELECT 1+1 AS result')
//   .then(result => console.log('Database connected:', result))
//   .catch(err => console.error('Database connection error:', err));


module.exports = {
  knex: knex
}