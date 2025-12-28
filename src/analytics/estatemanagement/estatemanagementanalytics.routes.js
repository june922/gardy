const express = require('express');
const router = express.Router();
const { getEstateManagementAnalytics } = require('./estatemanagementanalytics.controller');

router.get('/:userId', getEstateManagementAnalytics);

module.exports = router;
