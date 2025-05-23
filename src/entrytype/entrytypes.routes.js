const express = require ('express');
const router = express.Router ();
const controller = require ('./entrytypes.controller');


router.post ('/create', controller.create);
router.get("/", controller.getAllEntryType);
router.get("/:entrytypeid", controller.getTypeById);
router.patch('/:entrytypeid/update', controller.updateEntryType); // PATCH is preferred for partial updates



module.exports = router;