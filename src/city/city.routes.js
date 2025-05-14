const controller = require("./cityController");
const express = require('express');
const router = express.Router();


router.post("/create", controller.createCity);
router.get("/:id", controller.getCityById);
router.get("/", controller.getAllCities);

module.exports = router;