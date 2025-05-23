const express = require ('express'); 
const router = express.Router ();
const controller = require ('./vehicles.controller');

router.post ('/create', controller.createVehicle);
router.get('/:userId/vehicles', controller.getVehiclesByUserId);
router.get ("/:vehicleId",controller.getVehiclesById);
router.get ("/", controller.getAllVehicles);
router.patch("/:vehicleId", controller.updateVehicleDetails);
router.delete("/:vehicleid", controller.deleteVehicleById);


module.exports = router;