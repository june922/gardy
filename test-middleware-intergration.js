const express = require('express');
const request = require('supertest');
const authMiddlewares = require('./middleware/authJwt');

// Create a test app
const app = express();
app.use(express.json());

// Add test routes
app.get('/test-public', (req, res) => {
  res.json({ message: 'Public route' });
});

app.get('/test-protected', 
  authMiddlewares.verifyToken,
  (req, res) => {
    res.json({ 
      message: 'Protected route',
      userId: req.userId 
    });
  }
);

app.get('/test-admin', 
  authMiddlewares.verifyToken,
  authMiddlewares.isActive,
  authMiddlewares.isEstateAdmin,
  (req, res) => {
    res.json({ message: 'Admin route' });
  }
);

// Generate a test token
const jwt = require('jsonwebtoken');
const config = require('./config/auth.config');

async function runTests() {
  console.log('🧪 Testing Middleware Integration...\n');
  
  // Test 1: Public route
  console.log('1. Testing public route:');
  const publicRes = await request(app).get('/test-public');
  console.log(`   Status: ${publicRes.status} ${publicRes.status === 200 ? '✅' : '❌'}`);
  
  // Test 2: Protected route without token
  console.log('\n2. Testing protected route without token:');
  const noTokenRes = await request(app).get('/test-protected');
  console.log(`   Status: ${noTokenRes.status} ${noTokenRes.status === 401 ? '✅' : '❌'}`);
  
  // Create a test token
  const testToken = jwt.sign({ id: 1 }, config.secret, { expiresIn: '1h' });
  
  // Test 3: Protected route with token
  console.log('\n3. Testing protected route with valid token:');
  const withTokenRes = await request(app)
    .get('/test-protected')
    .set('Authorization', `Bearer ${testToken}`);
  console.log(`   Status: ${withTokenRes.status} ${withTokenRes.status === 200 ? '✅' : '❌'}`);
  
  // Test 4: Protected route with invalid token
  console.log('\n4. Testing protected route with invalid token:');
  const invalidRes = await request(app)
    .get('/test-protected')
    .set('Authorization', 'Bearer invalid-token-here');
  console.log(`   Status: ${invalidRes.status} ${invalidRes.status === 401 ? '✅' : '❌'}`);
  
  // Test 5: Admin route (will likely fail if user isn't estate admin)
  console.log('\n5. Testing admin route (may fail if user not admin):');
  const adminRes = await request(app)
    .get('/test-admin')
    .set('Authorization', `Bearer ${testToken}`);
  console.log(`   Status: ${adminRes.status}`);
  console.log(`   Expected: 200 or 403 based on user permissions`);
  
  console.log('\n🎉 Middleware integration tests completed!');
  process.exit(0);
}

// Install supertest if needed
try {
  runTests();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('Installing supertest for testing...');
    const { execSync } = require('child_process');
    execSync('npm install supertest --save-dev', { stdio: 'inherit' });
    console.log('Please run the test again.');
  } else {
    console.error('Error:', error.message);
  }
}