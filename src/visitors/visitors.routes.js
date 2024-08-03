const express = require ('express');
const router = express.Router ();
const controller = require ('./visitors.controller');

router.post ('/create', controller.createVisitors);
// router.patch ("/:usersid/update", controller.updatePersonalDetails);
router.get("/:visitorsid",controller.getVisitorsDetailsById);
router.get ("/", controller.getAllVisitors);
router.delete("/:visitorsid", controller.deleteVisitorsById)


module.exports = router;