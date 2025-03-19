const express = require ('express');
const router = express.Router ();
const controller = require ('./visitors.controller');
// const { get } = require('../../middleware/emailtransporter');

router.post ('/create', controller.createVisitor);
router.get("/:userId", controller.getVisitorsByUserId);
router.get("/", controller.getAllVisitors);
router.get('/id', controller.getVisitorById);
router.patch('/:visitorId', controller.updateVisitorDetails); // PATCH is preferred for partial updates

router.delete('/delete', controller.deleteVisitorsById);


module.exports = router;