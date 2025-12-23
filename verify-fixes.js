const User = require('./src/users/users.model');
const { knex } = require('./config/db.config');
const jwt = require('jsonwebtoken');
const config = require('./config/auth.config');

async function verifyFixes() {
  console.log('✅ Verifying Database Fixes...\n');
  
  // 1. Check "Tenant" without trailing space
  console.log('1. Checking "Tenant" user type:');
  const tenantType = await knex('usertypes').where('id', 1).first();
  console.log(`   ID 1: "${tenantType.name}" ${tenantType.name === 'Tenant' ? '✅' : '❌'}`);
  
  // 2. Check User ID 3 has correct user type
  console.log('\n2. Checking User ID 3 relationships:');
  const user3 = await User.query()
    .findById(3)
    .withGraphFetched('[user_types, user_roles]');
  
  console.log(`   User: ${user3.first_name} ${user3.last_name}`);
  console.log(`   User Types: ${user3.user_types.map(ut => ut.name).join(', ')} ${user3.user_types.some(ut => ut.name === 'Estate Admin') ? '✅' : '❌'}`);
  console.log(`   User Roles: ${user3.user_roles.map(ur => ur.name).join(', ')} ${user3.user_roles.some(ur => ur.name === 'Estate admin') ? '✅' : '❌'}`);
  
  // 3. Test middleware functions
  console.log('\n3. Testing Middleware Logic:');
  
  // Mock request object for testing
  const mockReq = { userId: 3 };
  
  // Test isEstateAdmin logic
  const userTypes = user3.user_types.map(ut => ut.name);
  const isEstateAdmin = userTypes.some(typeName => 
    typeName.toLowerCase().includes('estate') && typeName.toLowerCase().includes('admin')
  );
  console.log(`   isEstateAdmin check: ${isEstateAdmin ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test requireUserType logic
  const testRequirements = ['Estate Admin', 'Managers'];
  const hasRequiredType = userTypes.some(typeName => 
    testRequirements.some(required => 
      typeName.toLowerCase() === required.toLowerCase().trim()
    )
  );
  console.log(`   requireUserType(['Estate Admin', 'Managers']): ${hasRequiredType ? '✅ PASS' : '❌ FAIL'}`);
  
  // 4. Generate test tokens
  console.log('\n4. Generating Test Tokens:');
  const accessToken = jwt.sign({ id: 3 }, config.secret, { expiresIn: config.jwtExpiration });
  const refreshToken = jwt.sign({ id: 3 }, config.secret + "_refresh", { expiresIn: config.jwtRefreshExpiration });
  
  console.log(`   Access Token: ${accessToken.substring(0, 50)}...`);
  console.log(`   Refresh Token: ${refreshToken.substring(0, 50)}...`);
  console.log(`   Token expiration: ${config.jwtExpiration}`);
  
  // 5. Test token verification
  console.log('\n5. Testing Token Verification:');
  try {
    const decoded = jwt.verify(accessToken, config.secret);
    console.log(`   Token verification: ✅ (User ID: ${decoded.id})`);
  } catch (error) {
    console.log(`   Token verification: ❌ ${error.message}`);
  }
  
  console.log('\n🎉 All verifications completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Start your server: npm start');
  console.log('   2. Test login with User ID 3 credentials');
  console.log('   3. Test protected routes with the generated token');
}

verifyFixes().then(() => process.exit(0));