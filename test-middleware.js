// test-middleware.js
const jwt = require('jsonwebtoken');
const config = require('./config/auth.config');

console.log('Testing JWT Configuration...');
console.log('JWT Secret exists:', !!config.secret);
console.log('JWT Expiration:', config.jwtExpiration);
console.log('JWT Refresh Expiration:', config.jwtRefreshExpiration);

// Test token generation
const testPayload = { id: 1, email: 'test@test.com' };
const token = jwt.sign(testPayload, config.secret, { expiresIn: '1h' });
console.log('Token generated:', token ? '✅' : '❌');

// Verify token
try {
  const decoded = jwt.verify(token, config.secret);
  console.log('Token verification:', decoded ? '✅' : '❌');
} catch (error) {
  console.error('Token verification failed:', error.message);
}