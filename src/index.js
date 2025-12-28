const express = require('express');
const router = express.Router();
const authMiddlewares = require('../middleware/authJwt');

router.get('/v1', (req, res) => {
    res.json({
        message: "Garde API Endpoint",
    });
});

// Import all routes
const users = require('./users/users.routes');
const auth = require('./auth/auth.routes');
const vehicles = require('./Vehicles/vehicles.routes');
const usertypes = require('./usertypes/usertypes.routes');
const permissiontypes = require('./permissiontypes/permissiontypes.routes');
const permissions = require('./permissions/permissions.routes');
const entries = require('./entries/entries.routes');
const visitors = require('./visitors/visitors.routes');
const visitortypes = require('./visitortypes/visitortypes.routes');
const payments = require('./payments/payments.routes');
const subscriptions = require('./subscriptions/subscriptions.routes');
const notifications = require('./notifications/notifications.routes');
const notificationtype = require('./notificationtype/notificationtype.routes');
const category = require('./category/category.routes');
const estates = require('./estates/estates.routes');
const phases = require('./phases/phases.routes');
const blocks = require('./blocks/blocks.routes');
const houses = require('./houses/houses.routes');
const userroles = require('./userroles/userroles.routes');
const tenants = require('./tenants/tenants.routes');
const statuses = require('./statuses/statuses.routes');
const employees = require('./employees/employees.routes');
const city = require('./city/city.routes');
const vehicletypes = require('./vehicletypes/vehicletypes.routes');
const entrytypes = require('./entrytype/entrytypes.routes');
const secondaryTenantsRoutes = require('./tenants/secondary.routes');
const estateAnalytics = require('./analytics/estatemanagement/estatemanagementanalytics.routes');

//usage
router.use('/v1/users', users);
router.use('/v1/auth',auth);
router.use('/v1/vehicles', vehicles);
router.use('/v1/usertypes', usertypes);
router.use('/v1/permissiontypes', permissiontypes);
router.use('/v1/permissions', permissions);
router.use('/v1/entries', entries);
router.use('/v1/visitors', visitors);
router.use('/v1/visitortypes', visitortypes);
router.use('/v1/payments',payments);
router.use('/v1/subscriptions',subscriptions);
router.use('/v1/notifications',notifications);
router.use('/v1/notificationtype',notificationtype);
// router.use('/notificationstatus',notificationstatus);
router.use('/v1/category',category);
router.use('/v1/estates', estates);
router.use('/v1/phases', phases);
router.use('/v1/blocks', blocks);
router.use('/v1/houses', houses);
router.use('/v1/userroles', userroles);
router.use('/v1/tenants', tenants);
router.use('/v1/statuses', statuses);
router.use('/v1/employees', employees);
router.use('/v1/city', city);
router.use('/v1/vehicletypes', vehicletypes);
router.use('/v1/entrytypes', entrytypes);
router.use('/v1/tenants', secondaryTenantsRoutes);
router.use('/v1/analytics/estatemanagement', estateAnalytics);
// Add these test routes at the end of your main router file


// Test endpoints
router.get('/v1/test/middleware', 
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

router.get('/v1/test/tenant-access',
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

router.get('/v1/test/protected',
  authMiddlewares.verifyToken,
  authMiddlewares.isActive,
  (req, res) => {
    res.json({
      message: 'Basic protected route',
      userId: req.userId,
      timestamp: new Date().toISOString()
    });
  }
);
// Public routes
router.use('/v1/auth', auth);

// Protected routes with role-based access

// Estate Admin only routes
router.use('/v1/usertypes', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], usertypes);
router.use('/v1/userroles', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], userroles);
router.use('/v1/statuses', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], statuses);
router.use('/v1/estates', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], estates);
router.use('/v1/employees', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], employees);
router.use('/v1/subscriptions', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], subscriptions);
router.use('/v1/notificationtype', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isEstateAdmin], notificationtype);

// Estate Admin & Manager routes
router.use('/v1/vehicles', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], vehicles);
router.use('/v1/tenants', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], tenants);
router.use('/v1/houses', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], houses);
router.use('/v1/phases', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], phases);
router.use('/v1/blocks', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], blocks);
router.use('/v1/category', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], category);
router.use('/v1/permissiontypes', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Estate Admin', 'Managers'])], permissiontypes);

// Security Officer, Estate Admin & Manager routes
router.use('/v1/entries', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Security officers', 'Estate Admin', 'Managers'])], entries);
router.use('/v1/visitors', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Security officers', 'Estate Admin', 'Managers'])], visitors);
router.use('/v1/vehicletypes', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Security officers', 'Estate Admin', 'Managers'])], vehicletypes);
router.use('/v1/visitortypes', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Security officers', 'Estate Admin', 'Managers'])], visitortypes);
router.use('/v1/entrytypes', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Security officers', 'Estate Admin', 'Managers'])], entrytypes);

// Tenant routes (access to own data)
// Note: Users route will need additional checks in controller for data ownership
router.use('/v1/users', [authMiddlewares.verifyToken, authMiddlewares.isActive], users);
router.use('/v1/secondary-tenants', [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.requireUserType(['Tenant', 'Estate Admin'])], secondaryTenantsRoutes);

// Other authenticated routes
router.use('/v1/payments', [authMiddlewares.verifyToken, authMiddlewares.isActive], payments);
router.use('/v1/notifications', [authMiddlewares.verifyToken, authMiddlewares.isActive], notifications);
router.use('/v1/permissions', [authMiddlewares.verifyToken, authMiddlewares.isActive], permissions);
router.use('/v1/city', [authMiddlewares.verifyToken, authMiddlewares.isActive], city);

module.exports = router;