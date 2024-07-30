const express = require ('express');
const router = express.Router();
const controller = require ('./auth.controller');

router.post( "/signup", controller.signup)
router.post( "/signin", controller.signin)
router.post("/initiate-email-verify", controller.initiateEmailVerification);
router.post("/email-verify/:token", controller.emailVerification);

module.exports = router;