// Simple test without loading the full middleware
console.log('🧪 Simple Auth Test\n');

const jwt = require('jsonwebtoken');
const config = require('./config/auth.config');

// Test 1: Generate tokens
console.log('1. Generating tokens for User ID 3 (Estate Admin):');
const accessToken = jwt.sign({ id: 3 }, config.secret, { expiresIn: config.jwtExpiration });
const refreshToken = jwt.sign({ id: 3 }, config.secret + "_refresh", { expiresIn: config.jwtRefreshExpiration });

console.log(`   Access Token: ${accessToken.substring(0, 50)}...`);
console.log(`   Refresh Token: ${refreshToken.substring(0, 50)}...\n`);

// Test 2: Verify tokens
console.log('2. Verifying tokens:');
try {
  const decodedAccess = jwt.verify(accessToken, config.secret);
  console.log(`   Access Token valid: ✅ User ID ${decodedAccess.id}`);
} catch (error) {
  console.log(`   Access Token invalid: ❌ ${error.message}`);
}

try {
  const decodedRefresh = jwt.verify(refreshToken, config.secret + "_refresh");
  console.log(`   Refresh Token valid: ✅ User ID ${decodedRefresh.id}`);
} catch (error) {
  console.log(`   Refresh Token invalid: ❌ ${error.message}`);
}

// Test 3: Test token expiration
console.log('\n3. Testing expired token:');
const expiredToken = jwt.sign({ id: 3 }, config.secret, { expiresIn: '1s' });
setTimeout(() => {
  try {
    jwt.verify(expiredToken, config.secret);
    console.log('   ❌ Expired token should have failed!');
  } catch (error) {
    console.log(`   ✅ Correctly rejected expired token: ${error.message}`);
  }
}, 2000);

// Test 4: Test with wrong secret
console.log('\n4. Testing with wrong secret:');
const wrongToken = jwt.sign({ id: 3 }, 'wrong-secret', { expiresIn: '1h' });
try {
  jwt.verify(wrongToken, config.secret);
  console.log('   ❌ Should have failed with wrong secret!');
} catch (error) {
  console.log(`   ✅ Correctly rejected wrong secret: ${error.message}`);
}

// Wait for async tests
setTimeout(() => {
  console.log('\n🎉 Simple token tests completed!');
  console.log('\n📋 To test full middleware:');
  console.log('   1. Make sure authJwt.js is fixed');
  console.log('   2. Start your server: npm start');
  console.log('   3. Use this token to test:');
  console.log(`      ${accessToken}`);
  process.exit(0);
}, 3000);

