const express = require ('express');
const router = express.Router ();
const controller = require ('./visitors.controller');
// const { get } = require('../../middleware/emailtransporter');

router.post ('/create', controller.createVisitor);
router.get("/tenant/:tenantid", controller.getVisitorsByTenantId);
router.get("/", controller.getAllVisitors);
router.get("/:visitorid", controller.getVisitorById);
router.patch('/:visitorid/update', controller.updateVisitorDetails); // PATCH is preferred for partial updates

router.delete('/delete', controller.deleteVisitorsById);


module.exports = router;