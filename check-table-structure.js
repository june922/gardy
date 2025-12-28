const { knex } = require('./config/db.config');

async function checkTableStructure() {
  try {
    console.log('📊 Checking Exact Table Structure...\n');
    
    // Check userusertypes table
    console.log('1. userusertypes table structure:');
    const userUserTypesColumns = await knex('userusertypes').columnInfo();
    console.log('Columns:', Object.keys(userUserTypesColumns));
    
    // Check sample data
    const userUserTypesData = await knex('userusertypes').select('*').limit(3);
    console.log('Sample data:', userUserTypesData);
    
    console.log('\n2. useruserroles table structure:');
    const userUserRolesColumns = await knex('useruserroles').columnInfo();
    console.log('Columns:', Object.keys(userUserRolesColumns));
    
    // Check sample data
    const userUserRolesData = await knex('useruserroles').select('*').limit(3);
    console.log('Sample data:', userUserRolesData);
    
    console.log('\n3. usertypes table structure:');
    const userTypesColumns = await knex('usertypes').columnInfo();
    console.log('Columns:', Object.keys(userTypesColumns));
    
    console.log('\n4. userroles table structure:');
    const userRolesColumns = await knex('userroles').columnInfo();
    console.log('Columns:', Object.keys(userRolesColumns));
    
    // Check for any naming inconsistencies
    console.log('\n🔍 Checking for naming issues:');
    
    // Are column names exactly as expected?
    const expectedColumns = {
      userusertypes: ['user_id', 'user_type_id'],
      useruserroles: ['user_id', 'user_role_id'],
      usertypes: ['id', 'name'],
      userroles: ['id', 'name']
    };
    
    for (const [table, expected] of Object.entries(expectedColumns)) {
      try {
        const actualColumns = Object.keys(await knex(table).columnInfo());
        console.log(`\n${table}:`);
        console.log(`  Expected: ${expected.join(', ')}`);
        console.log(`  Actual: ${actualColumns.join(', ')}`);
        
        const matches = expected.every(col => actualColumns.includes(col));
        console.log(`  Match: ${matches ? '✅' : '❌'}`);
      } catch (err) {
        console.log(`\n${table}: ❌ ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();
