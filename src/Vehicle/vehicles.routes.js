const express = require ('express'); 
const router = express.Router ();
const controller = require ('./vehicles.controller');

router.post ('/create', controller.createVehicle);
router.get ("/:vehicleid",controller.getVehiclesById);
router.get ("/", controller.getAllVehicles);
router.patch("/:vehicleid", controller.updateVehicleDetails);
router.delete("/:vehicleid", controller.deleteVehicleById);

module.exports = router;