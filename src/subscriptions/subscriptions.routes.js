const controller = require("./subscriptionsController");
const express = require('express');
const router = express.Router();

router.post("/create", controller.createSubscription);
router.get("/:Id", controller.getSubscriptionById);
router.get("/", controller.getAllSubscriptions);
router.patch("/:Id", controller.updateSubscriptionDetails);
router.delete("/:Id", controller.deleteSubscriptionById);

module.exports = router;