const controller = require ('./userroles.controller');
const express = require ('express');
const router = express.Router();

router.post("/create", controller.createUserRoles);
router.get("/:id", controller.getuserRoleById);
router.get("/", controller.getAll);
router.patch("/:userroled/update", controller.update);
router.delete("/:userroleid", controller.deleteById);

module.exports = router;