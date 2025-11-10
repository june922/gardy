// routes/secondaryTenants.js - WITH AUTH MIDDLEWARE
const express = require('express');
const router = express.Router();
const secondaryTenantsController = require('./secondaryTenantsController');
const { authenticateToken } = require('../../middleware/authmiddleware'); // Now this exists!

// Use authentication middleware for all routes
router.use(authenticateToken);

// Secondary tenant routes
router.post('/house/:houseId/secondary', secondaryTenantsController.createSecondaryTenant);
router.get('/house/:houseId/secondary', secondaryTenantsController.getSecondaryTenantsByHouse);
router.get('/secondary/:tenantId', secondaryTenantsController.getSecondaryTenantById);
router.patch('/secondary/:tenantId', secondaryTenantsController.updateSecondaryTenant);
router.delete('/secondary/:tenantId', secondaryTenantsController.deleteSecondaryTenant);

module.exports = router;