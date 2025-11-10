const express = require('express');
const router = express.Router();


router.get('/v1', (req, res) => {
    res.json({
        message: "Garde API Endpoint",
    });
});
//routes
const users = require('./users/users.routes');
const auth = require('./auth/auth.routes');
const vehicles = require('./Vehicles/vehicles.routes');
const usertypes = require('./usertypes/usertypes.routes');
const permissiontypes = require('./permissiontypes/permissiontypes.routes');
const permissions = require('./permissions/permissions.routes');
const entries = require('./entries/entries.routes');
const visitors = require ('./visitors/visitors.routes');
const visitortypes = require('./visitortypes/visitortypes.routes');
const payments = require('./payments/payments.routes');
const subscriptions = require ('./subscriptions/subscriptions.routes');
const notifications = require('./notifications/notifications.routes');
const notificationtype = require('./notificationtype/notificationtype.routes');
// const notificationstatus= require('./notificationstatus/notificationstatus.routes')
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

module.exports = router;