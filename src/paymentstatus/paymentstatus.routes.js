const controller = require("./paymentstatusController");
const express = require('express');
const router = express.Router();

router.post("/create", controller.createPaymentStatus);
router.get("/:id", controller.getPaymentStatusById);
router.get("/", controller.getAllPaymentStatus);

module.exports = router;