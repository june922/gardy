const controller = require("./paymentsController");
const express = require('express');
const router = express.Router();

router.post("/create", controller.addPayment);
router.get("/:Id", controller.getPaymentById);
router.get("/", controller.getAllPayments);
router.patch("/:Id", controller.updatePaymentDetails);
router.delete("/:Id", controller.deletePaymentsById);

module.exports = router;