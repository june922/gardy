const { knex } = require('./config/db.config');

async function fixUserTypes() {
  console.log('🔧 Fixing User Type Analysis\n');
  
  // First, let's clean up the "Tenant " with trailing space
  console.log('1. Fixing "Tenant " with trailing space:');
  const tenantWithSpace = await knex('usertypes')
    .where('name', 'like', 'Tenant %')
    .orWhere('name', 'like', '% ')
    .select('*');
  
  console.log(`   Found ${tenantWithSpace.length} user types with potential space issues:`);
  tenantWithSpace.forEach(type => {
    console.log(`   - ID: ${type.id}, Name: "${type.name}" (Length: ${type.name.length})`);
  });
  
  // If "Tenant " exists with space, fix it
  const tenantRecord = await knex('usertypes').where('id', 1).first();
  if (tenantRecord && tenantRecord.name === 'Tenant ') {
    console.log('\n2. Fixing "Tenant " to "Tenant":');
    await knex('usertypes').where('id', 1).update({ name: 'Tenant' });
    console.log('   ✅ Fixed!');
  }
  
  // Check if we have "Estate Admin" user type
  console.log('\n3. Checking for Estate Admin user type:');
  const estateAdminTypes = await knex('usertypes')
    .where('name', 'like', '%Estate%Admin%')
    .orWhere('name', 'like', '%Admin%')
    .select('*');
  
  if (estateAdminTypes.length === 0) {
    console.log('   ❌ No Estate Admin user type found!');
    console.log('   Creating Estate Admin user type...');
    
    // Check if ID 3 is Estate Admin
    const typeId3 = await knex('usertypes').where('id', 3).first();
    if (typeId3 && typeId3.name !== 'Estate Admin') {
      await knex('usertypes').where('id', 3).update({ name: 'Estate Admin' });
      console.log('   ✅ Updated ID 3 to "Estate Admin"');
    }
  } else {
    console.log('   ✅ Estate Admin user type exists:');
    estateAdminTypes.forEach(type => {
      console.log(`   - ID: ${type.id}, Name: "${type.name}"`);
    });
  }
  
  // Now update user ID 3 to have Estate Admin user type (not Tenant)
  console.log('\n4. Updating user ID 3 to be Estate Admin (not Tenant):');
  const user3CurrentType = await knex('userusertypes')
    .where('user_id', 3)
    .first();
  
  if (user3CurrentType && user3CurrentType.user_type_id === 1) { // If currently Tenant
    // Find Estate Admin user type ID
    const estateAdminType = await knex('usertypes')
      .where('name', 'like', '%Estate%Admin%')
      .orWhere('name', 'like', '%Admin%')
      .first();
    
    if (estateAdminType) {
      await knex('userusertypes')
        .where('user_id', 3)
        .update({ user_type_id: estateAdminType.id });
      
      console.log(`   ✅ Updated user ID 3 to user type ID ${estateAdminType.id} ("${estateAdminType.name}")`);
    } else {
      console.log('   ❌ Could not find Estate Admin user type');
    }
  } else {
    console.log(`   User ID 3 already has user_type_id: ${user3CurrentType?.user_type_id}`);
  }
  
  // Verify the fix
  console.log('\n5. Verifying user ID 3 after fixes:');
  const user3Types = await knex('userusertypes')
    .where('user_id', 3)
    .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
    .select('usertypes.name');
  
  const user3Roles = await knex('useruserroles')
    .where('user_id', 3)
    .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
    .select('userroles.name');
  
  console.log(`   User Types: ${user3Types.map(ut => ut.name).join(', ')}`);
  console.log(`   User Roles: ${user3Roles.map(ur => ur.name).join(', ')}`);
  
  console.log('\n🎉 Fixes completed!');
}

// Ask for confirmation before making changes
console.log('WARNING: This script will modify your database!');
console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');

setTimeout(() => {
  fixUserTypes()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}, 5000);