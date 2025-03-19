const express = require ('express');
const router = express.Router();
const controller = require ('./auth.controller');


router.post( "/register", controller.registerUser)
router.post( "/signin", controller.signin)
router.post("/initiate-email-verification", controller.initiateEmailVerification);
router.post("/email-verify/:token", controller.emailVerification);

module.exports = router;