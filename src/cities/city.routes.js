const controller = require("./cityController");
const express = require('express');
const router = express.Router();
const authMiddlewares = require('../../middleware/authJwt');

router.post("/create", [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isAdmin, authMiddlewares.requireUserType(['system-user'])], controller.createCity);
router.get("/:id", controller.getCityById);
router.get("/", controller.getAllCities);

module.exports = router;