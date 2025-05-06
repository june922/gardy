const express = require ('express'); 
const router = express.Router ();
const controller = require ('./estates.controller');


router.get('/user/:userId/', controller.getEstatesByUserId);
router.post ('/create', controller.createEstate);
router.get ("/:Id",controller.getEstateById);
router.get ("/", controller.getAllEstates);
router.patch("/:Id", controller.updateEstateDetails);
router.delete("/:Id", controller.deleteEstateById);


module.exports = router;