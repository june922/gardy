const express = require ('express'); 
const router = express.Router ();
const controller = require ('./phases.controller');


router.get('/estate/:estateId/', controller.getPhasesByEstatesId);
router.post ('/create', controller.createPhases);
router.get ("/:Id",controller.getPhasesById);
router.get ("/", controller.getAllPhases);
router.patch("/:Id", controller.updatePhasesDetails);
router.delete("/:Id", controller.deletePhasesById);


module.exports = router;