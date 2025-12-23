const { knex } = require('./config/db.config');

async function testDatabaseStructure() {
  try {
    console.log('🔍 Testing Database Structure...\n');
    
    // Check if relationship tables exist and have data
    const tables = ['userusertypes', 'useruserroles', 'usertypes', 'userroles'];
    
    for (const table of tables) {
      try {
        const result = await knex(table).select('*').limit(3);
        console.log(`${table}:`);
        console.log(`  - Exists: ✅`);
        console.log(`  - Row count: ${result.length}`);
        if (result.length > 0) {
          console.log(`  - Sample data:`, JSON.stringify(result[0], null, 2).split('\n').slice(0, 3).join('\n'));
        }
        console.log('');
      } catch (error) {
        console.log(`${table}: ❌ Error - ${error.message}\n`);
      }
    }
    
    // Check a specific user's relationships
    console.log('👤 Checking user relationships for ID 1:');
    
    const userTypes = await knex('userusertypes')
      .where('user_id', 1)
      .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
      .select('usertypes.*');
    
    console.log(`  User Types via raw query: ${userTypes.length} found`);
    userTypes.forEach(ut => console.log(`    - ${ut.name} (ID: ${ut.id})`));
    
    const userRoles = await knex('useruserroles')
      .where('user_id', 1)
      .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
      .select('userroles.*');
    
    console.log(`  User Roles via raw query: ${userRoles.length} found`);
    userRoles.forEach(ur => console.log(`    - ${ur.name} (ID: ${ur.id})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabaseStructure();