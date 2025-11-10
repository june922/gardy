// middleware/permissionMiddleware.js
const checkSecondaryTenantPermissions = (req, res, next) => {
  const userRole = req.user.role_id;
  
  // Block secondary tenants from creating other secondary tenants
  if (userRole === 24) { // Secondary Tenant role ID
    if (req.path.includes('/secondary-tenants') && req.method === 'POST') {
      return res.status(403).json({
        message: 'Family members cannot add other family members. Please ask the main tenant.'
      });
    }
  }
  next();
};

module.exports = {
  checkSecondaryTenantPermissions
};