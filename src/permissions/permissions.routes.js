const controller = require ('./permissions.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.createPermissions);
router.get("/:permissionid", controller.getPermissionsById);
router.get("/", controller.getAllPermissions);
router.patch("/:permissionid", controller.updatePermissionDetails);
router.delete("/:permissionid", controller.deletePermissionsById);

module.exports = router;