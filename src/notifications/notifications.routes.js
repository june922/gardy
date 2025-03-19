
const controller = require("./notificationsController");
const express = require('express');
const router = express.Router();


router.post("/create", controller.createNotification);
router.get("/:id", controller.getNotificationById);
router.get("/",  controller.getAllNotifications);


module.exports = router;
