const controller = require ('./usertypes.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.createUserTypes);
router.get("/:id", controller.getUserTypeById);
router.get("/", controller.getAllUserTypes);
router.patch("/:usertypeid/update", controller.updateUserTypes);
router.delete("/:usertypeid", controller.deleteUserTypeById);

module.exports = router;