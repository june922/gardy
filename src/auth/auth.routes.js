const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const authMiddlewares = require('../../middleware/authJwt');

router.post('/register', controller.registerUser);
router.post("/signin", controller.signIn);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", [authMiddlewares.verifyToken], controller.logout);
router.post("/initiate-password-reset", controller.initiatePasswordReset);
router.post("/password-reset", controller.passwordReset);

module.exports = router;