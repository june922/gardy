const controller = require ('./checkintypes.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.create);
router.get("/:id", controller.getTypeById);
router.get("/", controller.getAllCheckinTypes);
router.patch("/:usertypeid/update", controller.updateCheckinType);
router.delete("/:usertypeid", controller.deletecheckinTypeById);

module.exports = router;