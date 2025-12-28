// Create a test script: test-relationships.js
const User = require('./src/users/users.model');

async function testRelationships() {
  try {
    console.log('Testing User Model Relationships...');
    
    // Test 1: Get a user with their types and roles
    const user = await User.query()
      .findById(1) // Use an existing user ID
      .withGraphFetched('[user_types, user_roles]');
    
    console.log('User:', user ? 'Found' : 'Not found');
    if (user) {
      console.log('User Types:', user.user_types);
      console.log('User Roles:', user.user_roles);
    }
    
    console.log('✅ Relationship test completed');
  } catch (error) {
    console.error('❌ Error testing relationships:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRelationships();