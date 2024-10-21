const controller = require ('./permissions.controller');
const express = require ('express');
const router = express.Router();

router.post('/create', controller.createPermissions);
router.get('/:userId/permissions', controller.getPermissionsByUserId);
router.get("/:permissionId", controller.getPermissionsById);
router.get("/", controller.getAllPermissions);
router.patch("/:permissionId", controller.updatePermissionDetails);
router.delete("/:permissionId", controller.deletePermissionsById);

module.exports = router;