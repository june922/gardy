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


//usage
router.use('/v1/users',users);
router.use('/v1/auth',auth);
router.use('/v1/vehicles',vehicles);

module.exports = router;