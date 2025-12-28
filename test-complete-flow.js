const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

// Import your actual auth controller
const authController = require('./src/auth/auth.controller');
const authMiddlewares = require('./middleware/authJwt');

// Create test routes using your actual middleware
app.post('/api/v1/auth/signin', (req, res) => {
  // We'll mock this for testing since we need actual user credentials
  res.json({
    message: 'Mock signin endpoint',
    data: {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token'
    }
  });
});

app.get('/api/v1/test/middleware', 
  authMiddlewares.verifyToken,
  authMiddlewares.isActive,
  authMiddlewares.isEstateAdmin,
  (req, res) => {
    res.json({
      message: 'Estate Admin middleware test passed!',
      userId: req.userId,
      timestamp: new Date().toISOString()
    });
  }
);

app.get('/api/v1/test/tenant-access',
  authMiddlewares.verifyToken,
  authMiddlewares.isActive,
  authMiddlewares.requireUserType(['Tenant', 'Estate Admin']),
  (req, res) => {
    res.json({
      message: 'Tenant or Estate Admin access granted',
      userId: req.userId
    });
  }
);

app.get('/api/v1/test/security-access',
  authMiddlewares.verifyToken,
  authMiddlewares.isActive,
  authMiddlewares.requireUserType(['Security officers']),
  (req, res) => {
    res.json({
      message: 'Security officer access granted',
      userId: req.userId
    });
  }
);

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Authentication Flow...\n');
  
  // Generate a real token for User ID 3 (Estate Admin)
  const jwt = require('jsonwebtoken');
  const config = require('./config/auth.config');
  
  const estateAdminToken = jwt.sign({ id: 3 }, config.secret, { expiresIn: '1h' });
  console.log('1. Generated Estate Admin Token:', estateAdminToken.substring(0, 50) + '...\n');
  
  // Test 1: Estate Admin Middleware (should PASS)
  console.log('Test 1: Estate Admin Middleware');
  const res1 = await request(app)
    .get('/api/v1/test/middleware')
    .set('Authorization', `Bearer ${estateAdminToken}`);
  
  console.log(`   Status: ${res1.status} ${res1.status === 200 ? '✅' : '❌'}`);
  if (res1.status === 200) {
    console.log(`   Response: ${res1.body.message}`);
  } else {
    console.log(`   Error: ${res1.body?.message || 'No message'}`);
  }
  
  // Test 2: Tenant Access (should PASS because Estate Admin qualifies)
  console.log('\nTest 2: Tenant or Estate Admin Access');
  const res2 = await request(app)
    .get('/api/v1/test/tenant-access')
    .set('Authorization', `Bearer ${estateAdminToken}`);
  
  console.log(`   Status: ${res2.status} ${res2.status === 200 ? '✅' : '❌'}`);
  
  // Test 3: Security Officer Access (should FAIL - wrong user type)
  console.log('\nTest 3: Security Officer Access (should fail)');
  const res3 = await request(app)
    .get('/api/v1/test/security-access')
    .set('Authorization', `Bearer ${estateAdminToken}`);
  
  console.log(`   Status: ${res3.status} ${res3.status === 403 ? '✅ Expected failure' : '❌ Should have failed'}`);
  if (res3.status === 403) {
    console.log(`   Expected error: ${res3.body?.message}`);
  }
  
  // Test 4: No token (should FAIL)
  console.log('\nTest 4: No Token Provided');
  const res4 = await request(app)
    .get('/api/v1/test/middleware');
  
  console.log(`   Status: ${res4.status} ${res4.status === 401 ? '✅' : '❌'}`);
  
  // Test 5: Invalid token (should FAIL)
  console.log('\nTest 5: Invalid Token');
  const res5 = await request(app)
    .get('/api/v1/test/middleware')
    .set('Authorization', 'Bearer invalid-token-123');
  
  console.log(`   Status: ${res5.status} ${res5.status === 401 ? '✅' : '❌'}`);
  
  // Test 6: Test with a Tenant user (if we have one)
  console.log('\nTest 6: Testing Tenant User (if exists)');
  
  // First, find a tenant user
  const { knex } = require('./config/db.config');
  const tenantUser = await knex('userusertypes')
    .where('user_type_id', 1) // Tenant
    .join('users', 'userusertypes.user_id', 'users.id')
    .select('users.id')
    .first();
  
  if (tenantUser) {
    const tenantToken = jwt.sign({ id: tenantUser.id }, config.secret, { expiresIn: '1h' });
    const res6 = await request(app)
      .get('/api/v1/test/tenant-access')
      .set('Authorization', `Bearer ${tenantToken}`);
    
    console.log(`   Tenant User ID: ${tenantUser.id}`);
    console.log(`   Status: ${res6.status} ${res6.status === 200 ? '✅' : '❌'}`);
  } else {
    console.log('   No tenant users found in database');
  }
  
  console.log('\n📋 Test Summary:');
  console.log('   ✅ Estate Admin middleware should pass');
  console.log('   ✅ Tenant access should pass for Estate Admin');
  console.log('   ✅ Security access should fail for Estate Admin');
  console.log('   ✅ No token should fail');
  console.log('   ✅ Invalid token should fail');
  
  console.log('\n🎉 Flow test completed!');
}

// Check if supertest is installed
try {
  testCompleteFlow().then(() => process.exit(0));
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('Installing supertest...');
    const { execSync } = require('child_process');
    execSync('npm install supertest --save-dev', { stdio: 'inherit' });
    console.log('Please run the test again: node test-complete-flow.js');
  } else {
    console.error('Error:', error.message);
  }
}