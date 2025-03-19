
const controller = require("./notificationtypeController");
const express = require('express');
const router = express.Router();


router.post("/create", controller.createNotificationType);
router.get("/:id", controller.getNotificationTypeById);
router.get("/",  controller.getAllNotificationType);
router.patch("/:id/update", controller.updateNotificationType);
router.delete("/:id", controller.deleteNotificationType);

module.exports = router;
