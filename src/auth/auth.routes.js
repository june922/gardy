const express = require ('express');
const router = express.Router();
const controller = require ('./auth.controller');


router.post('/register', controller.registerUser);
router.post( "/signin", controller.signIn);
//router.post("/email-verify", controller.EmailVerification);
router.post("/initiate-password-reset", controller.initiatePasswordReset);
router.post("/password-reset", controller.passwordReset);

module.exports = router;