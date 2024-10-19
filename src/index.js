const express = require('express');
const router = express.Router();


router.get('/v1', (req, res) => {
    res.json({
        message: "Garde API Endpoint",
    });
});
//routes
const users = require('./users/users.routes');
const auth = require('./auth/auth.routes')
const vehicles = require('./Vehicle/vehicles.routes')

const usertypes = require('./usertypes/usertypes.routes');
const permissiontypes = require('./permissiontypes/permissiontypes.routes');
const permissions = require('./permissions/permissions.routes');
// const entries = require('./entries/entries.routes');

//usage
router.use('/v1/users', users);
router.use('/v1/auth',auth);
router.use('/v1/vehicles', vehicles);
router.use('/v1/usertypes', usertypes);
router.use('/v1/permissiontypes', permissiontypes);
router.use('/v1/permissions', permissions);
// router.use('/v1/entries', entries);

module.exports = router;