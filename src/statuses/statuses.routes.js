const controller = require ('./statuses.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.createStatus);
router.get("/:statusid", controller.getStatusById);
router.get("/", controller.getAllStatuses);
router.patch("/:statusid/update", controller.updateStatus);
router.delete("/:statusid", controller.deleteStatusById);

module.exports = router;