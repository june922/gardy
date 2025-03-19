const express = require ('express');
const router = express.Router ();
const controller = require ('./visitortypes.controller');


router.get("/", controller.getAllVisitorTypes);



module.exports = router;