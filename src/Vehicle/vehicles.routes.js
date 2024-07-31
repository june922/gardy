const express = require ('express'); 
const router = express.Router ();
const controller = require ('./vehicles.controller');

router.post ('/create', controller.createVehicle);
router.get ("/:id",controller.getVehiclesById)
router.get ("/", controller.getAllVehicles);


module.exports = router;