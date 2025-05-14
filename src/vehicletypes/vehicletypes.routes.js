const controller = require ('./vehicletypes.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.create);
router.get("/:id", controller.getById);
router.get("/", controller.getAll);
router.patch("/:vehicletypeid/update", controller.updateVehicleTypes);
router.delete("/:vehicletypeid", controller.deleteVehicleType);

module.exports = router;