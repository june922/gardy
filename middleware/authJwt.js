const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../src/users/users.model.js");
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token has expired!" });
  }
  return res.status(401).send({ message: "Unauthorized!" });
};

// 1. Verify Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized!' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

// 2. Check if user is active
const isActive = async (req, res, next) => {
  try {
    const user = await User.query()
      .findById(req.userId)
      .withGraphFetched('[tenant, employee]');
    
    if (!user) {
      return res.status(401).send({ message: 'User not found!' });
    }
    
    // Get user types to determine what status to check
    const userTypes = await user.$relatedQuery('user_types');
    const userTypeNames = userTypes.map(ut => ut.name.trim());
    
    let isActiveUser = false;
    
    // Check based on user type
    if (userTypeNames.includes('Tenant')) {
      // For tenants, check tenant status
      if (user.tenant) {
        const tenantStatus = await user.tenant.$relatedQuery('status');
        isActiveUser = tenantStatus && tenantStatus.name === "Active";
      }
    } else if (userTypeNames.includes('Security officers') || userTypeNames.includes('Managers')) {
      // For employees, check employee status
      if (user.employee) {
        const employeeStatus = await user.employee.$relatedQuery('status');
        isActiveUser = employeeStatus && employeeStatus.name !== "Suspended";
      }
    } else if (userTypeNames.some(name => 
      name.toLowerCase().includes('estate') && name.toLowerCase().includes('admin')
    )) {
      // Estate Admin is always active
      isActiveUser = true;
    } else {
      // Secondary tenant or other types
      isActiveUser = true; // Default to true, adjust as needed
    }
    
    if (isActiveUser) {
      next();
    } else {
      return res.status(401).send({ 
        message: "Sorry, your account is not active!" 
      });
    }
    
  } catch (error) {
    console.error("Error in isActive middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// 3. Check specific user types
const requireUserType = (userTypeArray) => {
  return async (req, res, next) => {
    try {
      const user = await User.query()
        .findById(req.userId)
        .withGraphFetched('user_types');
      
      if (!user) {
        return res.status(401).send({ message: 'User not found!' });
      }
      
      const userTypeNames = user.user_types.map(ut => ut.name.trim());
      
      console.log('DEBUG requireUserType - User types:', userTypeNames);
      console.log('DEBUG requireUserType - Required:', userTypeArray);
      
      // Check if user has any of the required user types (trimmed)
      const hasRequiredType = userTypeNames.some(typeName => 
        userTypeArray.some(required => 
          typeName.toLowerCase() === required.toLowerCase().trim()
        )
      );
      
      if (hasRequiredType || userTypeArray.includes('all')) {
        next();
      } else {
        res.status(403).send({ 
          message: `Unauthorized! Required user type not found. You have: ${userTypeNames.join(', ')}` 
        });
      }
    } catch (error) {
      console.error("Error in requireUserType middleware:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
};

// 4. Check specific user roles
const requireUserRole = (roleArray) => {
  return async (req, res, next) => {
    try {
      const user = await User.query()
        .findById(req.userId)
        .withGraphFetched('user_roles');
      
      if (!user) {
        return res.status(401).send({ message: 'User not found!' });
      }
      
      const userRoleNames = user.user_roles.map(ur => ur.name.trim());
      
      // Check if user has any of the required roles
      const hasRequiredRole = userRoleNames.some(roleName => 
        roleArray.some(required => 
          roleName.toLowerCase() === required.toLowerCase().trim()
        )
      );
      
      if (hasRequiredRole || roleArray.includes('all')) {
        next();
      } else {
        res.status(403).send({ 
          message: "Unauthorized! Required role not found." 
        });
      }
    } catch (error) {
      console.error("Error in requireUserRole middleware:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
};
const isMyEstatesOnly = async (req, res, next) => {
  try {
    const requestedUserId = req.params.userId || req.params.userid;
    
    if (!requestedUserId) {
      return res.status(400).send({ message: "User ID missing" });
    }
    
    // ONLY allow if accessing own data
    if (parseInt(req.userId) === parseInt(requestedUserId)) {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized! Can only access your own estates."
      });
    }
  } catch (error) {
    console.error("Error in isMyEstatesOnly:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
// 5. Check if accessing own data or is Estate Admin
const isMyDataOrEstateAdmin = async (req, res, next) => {
  try {
    // Try different parameter names
    const userId = req.params.userId || req.params.userid || req.params.usersid;
    
    if (!userId) {
      return res.status(400).send({ 
        message: "User ID parameter missing in request" 
      });
    }
    
    const isMyData = (req.userId == userId);
    
    const user = await User.query()
      .findById(req.userId)
      .withGraphFetched('user_types');
    
    const userTypeNames = user.user_types.map(ut => ut.name.trim());
    const isEstateAdmin = userTypeNames.some(typeName => 
      typeName.toLowerCase().includes('estate') && typeName.toLowerCase().includes('admin')
    );
    
    if (isMyData || isEstateAdmin) {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized! Can only access your own data unless you are Estate Admin."
      });
    }
  } catch (error) {
    console.error("Error in isMyDataOrEstateAdmin middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// 6. Check if Estate Admin only
const isEstateAdmin = async (req, res, next) => {
  try {
    const user = await User.query()
      .findById(req.userId)
      .withGraphFetched('user_types');
    
    if (!user || !user.user_types) {
      return res.status(403).send({
        message: "Unauthorized! User not found or has no user types."
      });
    }
    
    const userTypeNames = user.user_types.map(ut => ut.name.trim());
    
    console.log('DEBUG isEstateAdmin - User types:', userTypeNames);
    
    // Check for "Estate Admin" (with or without spaces/case)
    const isEstateAdminUser = userTypeNames.some(typeName => 
      typeName.toLowerCase().includes('estate') && typeName.toLowerCase().includes('admin')
    );
    
    if (isEstateAdminUser) {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized! Estate Admin access required."
      });
    }
  } catch (error) {
    console.error("Error in isEstateAdmin middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// 7. Check if Security Officer
const isSecurityOfficer = async (req, res, next) => {
  try {
    const user = await User.query()
      .findById(req.userId)
      .withGraphFetched('user_types');
    
    const userTypeNames = user.user_types.map(ut => ut.name.trim());
    
    if (userTypeNames.includes('Security officers')) {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized! Security Officer access required."
      });
    }
  } catch (error) {
    console.error("Error in isSecurityOfficer middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// 8. Check if Manager
const isManager = async (req, res, next) => {
  try {
    const user = await User.query()
      .findById(req.userId)
      .withGraphFetched('user_types');
    
    const userTypeNames = user.user_types.map(ut => ut.name.trim());
    
    if (userTypeNames.includes('Managers')) {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized! Manager access required."
      });
    }
  } catch (error) {
    console.error("Error in isManager middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// 9. Check if accessing own data only
const isMyData = async (req, res, next) => {
  try {
    console.log('🔒 isMyData Middleware - Checking access');
    console.log('  Current user ID:', req.userId);
    console.log('  All params:', req.params);
    
    // Try different parameter names
    const requestedUserId = req.params.userId || req.params.userid || req.params.usersid;
    
    console.log('  Requested user ID (found):', requestedUserId);
    
    if (!requestedUserId) {
      console.log('  ❌ No user ID parameter found');
      return res.status(400).send({
        message: "User ID parameter missing. Looking for: userId, userid, or usersid"
      });
    }
    
    if (parseInt(req.userId) === parseInt(requestedUserId)) {
      console.log('  ✅ Access granted - Same user');
      next();
    } else {
      console.log('  ❌ Access denied - Different user');
      res.status(403).send({
        message: "Unauthorized! Can only access your own data."
      });
    }
  } catch (error) {
    console.error("Error in isMyData middleware:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Export all middleware functions
const authJwt = {
  verifyToken: verifyToken,
  isActive: isActive,
  requireUserType: requireUserType,
  requireUserRole: requireUserRole,
  isMyDataOrEstateAdmin: isMyDataOrEstateAdmin,
  isEstateAdmin: isEstateAdmin,
  isMyEstatesOnly,
  isSecurityOfficer: isSecurityOfficer,
  isManager: isManager,
  isMyData: isMyData
};

module.exports = authJwt;