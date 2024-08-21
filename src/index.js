const express = require('express');
const router = express.Router();


router.get('/v1', (req, res) => {
    res.json({
        message: "Garde API Endpoint",
    });
});
//routes
const users = require ('./users/users.routes');
const auth = require ('./auth/auth.routes')
const vehicles = require ('./Vehicle/vehicles.routes')
const visitortypes = require ('./visitortypes/visitortypes.routes')
const visitors = require ('./visitors/visitors.routes')
const usertypes= require('./usertypes/usertypes.routes');
const permissiontypes= require('./permissiontypes/permissiontypes.routes');
//usage
router.use('/v1/users',users);
router.use('/v1/auth',auth);
router.use('/v1/vehicles',vehicles);
router.use('/v1/visitortypes',visitortypes);
router.use('/v1/visitors',visitors);
router.use('/v1/usertypes',usertypes);
router.use('/V1/permissiontypes',permissiontypes);

module.exports = router;