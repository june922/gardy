const { knex } = require('./config/db.config');
const User = require('./src/users/users.model');

async function testFixRelationships() {
  try {
    console.log('🔧 Fixing and Testing Relationships...\n');
    
    // 1. First, let's see all users
    console.log('1. Listing all users:');
    const allUsers = await knex('users').select('id', 'first_name', 'last_name', 'user_email').limit(10);
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.user_email}`);
    });
    
    console.log('\n2. Checking which users have relationships:');
    
    for (const user of allUsers) {
      const userTypes = await knex('userusertypes')
        .where('user_id', user.id)
        .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
        .select('usertypes.name');
      
      const userRoles = await knex('useruserroles')
        .where('user_id', user.id)
        .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
        .select('userroles.name');
      
      if (userTypes.length > 0 || userRoles.length > 0) {
        console.log(`\n   User ID ${user.id} (${user.first_name}):`);
        if (userTypes.length > 0) {
          console.log(`     User Types: ${userTypes.map(ut => ut.name).join(', ')}`);
        }
        if (userRoles.length > 0) {
          console.log(`     User Roles: ${userRoles.map(ur => ur.name).join(', ')}`);
        }
      }
    }
    
    console.log('\n3. Testing User Model with ID 3 (from earlier data):');
    
    // Test with user ID 3 (which has relationships)
    const userWithRelations = await User.query()
      .findById(3)
      .withGraphFetched('[user_types, user_roles]');
    
    if (userWithRelations) {
      console.log(`   Found user: ${userWithRelations.first_name} ${userWithRelations.last_name}`);
      console.log(`   User Types: ${userWithRelations.user_types ? userWithRelations.user_types.map(ut => ut.name).join(', ') : 'None'}`);
      console.log(`   User Roles: ${userWithRelations.user_roles ? userWithRelations.user_roles.map(ur => ur.name).join(', ') : 'None'}`);
      
      if (userWithRelations.user_types && userWithRelations.user_types.length > 0) {
        console.log('   ✅ Relationships working correctly!');
      } else {
        console.log('   ❌ Relationships still empty - checking table names...');
        
        // Check exact table and column names
        const tableInfo = await knex.raw(`
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name IN ('userusertypes', 'useruserroles', 'usertypes', 'userroles')
          ORDER BY table_name, ordinal_position;
        `);
        
        console.log('\n   Database structure:');
        console.log(JSON.stringify(tableInfo.rows, null, 2));
      }
    } else {
      console.log('   ❌ User ID 3 not found');
    }
    
    // 4. Test the middleware with a user that has relationships
    console.log('\n4. Testing middleware with user that has relationships:');
    
    // Generate token for user ID 3
    const jwt = require('jsonwebtoken');
    const config = require('./config/auth.config');
    
    if (userWithRelations) {
      const token = jwt.sign({ id: 3 }, config.secret, { expiresIn: '1h' });
      console.log(`   Token generated for user ID 3: ${token.substring(0, 50)}...`);
      
      // Test if user is Estate Admin
      const userTypes = userWithRelations.user_types || [];
      const isEstateAdmin = userTypes.some(ut => ut.name === 'Estate Admin');
      console.log(`   Is Estate Admin: ${isEstateAdmin ? '✅ Yes' : '❌ No'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testFixRelationships();