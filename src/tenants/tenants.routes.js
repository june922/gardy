const express = require ('express');
const router = express.Router ();
const controller = require ('./tenants.controller');

router.post ('/create', controller.createTenants);
router.patch ("/:tenantid/update", controller.updateTenantDetails);
router.get("/:tenantid",controller.getTenantDetailsById);
router.get ("/", controller.getAllTenants);
router.delete("/:id", controller.deleteTenantsById);


module.exports = router;