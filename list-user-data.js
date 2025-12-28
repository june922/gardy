const { knex } = require('./config/db.config');

async function listUserData() {
  console.log('📋 Complete User Data Analysis\n');
  
  // List all user types exactly as stored
  console.log('1. ALL User Types in database:');
  const allUserTypes = await knex('usertypes').select('*');
  allUserTypes.forEach(ut => {
    console.log(`   ID: ${ut.id}, Name: "${ut.name}" (Length: ${ut.name.length})`);
  });
  
  console.log('\n2. ALL User Roles in database:');
  const allUserRoles = await knex('userroles').select('*');
  allUserRoles.forEach(ur => {
    console.log(`   ID: ${ur.id}, Name: "${ur.name}"`);
  });
  
  console.log('\n3. User ID 3 complete details:');
  const user3 = await knex('users').where('id', 3).first();
  console.log(`   User: ${user3.first_name} ${user3.last_name}`);
  console.log(`   Email: ${user3.user_email}`);
  
  const user3Types = await knex('userusertypes')
    .where('user_id', 3)
    .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
    .select('usertypes.id', 'usertypes.name');
  
  console.log(`   User Types: ${user3Types.map(ut => `ID ${ut.id}="${ut.name}"`).join(', ')}`);
  
  const user3Roles = await knex('useruserroles')
    .where('user_id', 3)
    .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
    .select('userroles.id', 'userroles.name');
  
  console.log(`   User Roles: ${user3Roles.map(ur => `ID ${ur.id}="${ur.name}"`).join(', ')}`);
  
  console.log('\n4. Checking for Estate Admin user type:');
  const estateAdminType = await knex('usertypes')
    .where('name', 'like', '%Estate%')
    .orWhere('name', 'like', '%Admin%')
    .select('*');
  
  console.log(`   Found: ${estateAdminType.length} records`);
  estateAdminType.forEach(type => {
    console.log(`   - ID: ${type.id}, Name: "${type.name}"`);
  });
}

listUserData().then(() => process.exit(0));