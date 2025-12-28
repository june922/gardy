const express = require ('express'); 
const router = express.Router ();
const controller = require ('./estates.controller');
const authMiddlewares = require('../../middleware/authJwt');



router.get('/user/:userId/', 
  [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isMyData],
  controller.getEstatesByUserId
);
router.post ('/create', controller.createEstate);
router.get ("/:Id",controller.getEstateById);
router.get ("/", controller.getAllEstates);
router.patch("/:Id", controller.updateEstateDetails);
router.delete("/:Id", controller.deleteEstateById);


module.exports = router;