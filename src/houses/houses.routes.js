const express = require ('express'); 
const router = express.Router ();
const controller = require ('./houses.controller');


router.get('/location', controller.getHousesByLocation);
router.post ('/create', controller.createHouses);
router.get ("/:Id",controller.getHousesById);
router.get ("/", controller.getAllHouses);
router.patch("/:Id", controller.updateHouseDetails);
router.delete("/:Id", controller.deleteHousesById);


module.exports = router; 