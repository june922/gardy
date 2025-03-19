const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');

// Define the route and associate it with the controller
router.get('/', categoryController.getAllCategory);

module.exports = router;
