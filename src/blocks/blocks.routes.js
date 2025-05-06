const express = require ('express'); 
const router = express.Router ();
const controller = require ('./blocks.controller');


router.get('/phase/:phaseId/', controller.getBlocksByPhaseId);
router.post ('/create', controller.createBlocks);
router.get ("/:Id",controller.getBlocksById);
router.get ("/", controller.getAllBlocks);
router.patch("/:Id", controller.updateBlocksDetails);
router.delete("/:Id", controller.deleteBlocksById);


module.exports = router;