const express = require ('express'); 
const router = express.Router ();
const controller = require ('./visitortypes.controller');

router.post ('/create', controller.createVisitorTypes);
router.get ("/:visitortypesid",controller.getVisitorTypeById);
router.get ("/", controller.getAllVisitorTypes);
router.patch("/:visitortypesid", controller.updateVisitorTypes);
router.delete("/:visitortypesid", controller.deleteVisitorTypesById);

module.exports = router;