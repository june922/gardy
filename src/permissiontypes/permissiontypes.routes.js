const controller = require ('./permissiontypes.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.createPermissionTypes);
router.get("/:permissiontypeid", controller.getPermissionTypeById);
router.get("/", controller.getAllPermissionTypes);
router.patch("/:permissiontypeid", controller.updatePermissionTypes);
router.delete("/:permissiontypeid", controller.deletePermissionTypeById);

module.exports = router;