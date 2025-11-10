// middleware/authMiddleware.js - FIXED ROLE MAPPING
const jwt = require('jsonwebtoken');
const users = require('../src/users/users.model');
const useruserroles = require('../src/useruserroles/useruserroles.model');
const userroles = require('../src/userroles/userroles.model');
const userusertypes = require('../src/userusertypes/userusertypes.model');
const usertypes = require('../src/usertypes/usertypes.model');
const tenants = require('../src/tenants/tenants.model'); // Add this

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get basic user info
    const user = await users.query()
      .findById(decoded.id)
      .select('id', 'first_name', 'last_name', 'user_email', 'phone_number', 'estate_id', 'status_id');

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    // Get user role
    let userRole = null;
    try {
      userRole = await useruserroles.query()
        .where('user_id', user.id)
        .join('userroles', 'useruserroles.user_role_id', 'userroles.id')
        .select('userroles.id as role_id', 'userroles.name as role_name')
        .first();
      
      console.log('🔍 Found user role:', userRole);
    } catch (error) {
      console.log('⚠️ Role query failed:', error.message);
    }

    // Get user type
   // In your auth middleware or permission check
const userType = await userusertypes.query()
  .where('user_id', user.id)
  .join('usertypes', 'userusertypes.user_type_id', 'usertypes.id')
  .select('usertypes.id as type_id', 'usertypes.name as type_name')
  .first();

// Block Secondary Tenants (type_id 24) from creating other secondary tenants
if (userType?.type_id === 24) {
  // Block access to create secondary tenants
}
    // Set user object on request
    req.user = {
      userId: user.id,
      email: user.user_email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      estate_id: user.estate_id,
      status_id: user.status_id,
      role_id: userRole?.role_id || 3, // Default to tenant role
      role_name: userRole?.role_name || 'Tenant',
      user_type_id: userType?.type_id || 1, // Default to tenant type
      user_type_name: userType?.type_name || 'Tenant'
    };

    console.log('🔐 Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }

    return res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  authenticateToken
};