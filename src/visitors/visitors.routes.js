const express = require ('express');
const router = express.Router ();
const controller = require ('./visitors.controller');

router.post ('/create', controller.createVisitor);
// router.patch ("/:usersid/update", controller.updatePersonalDetails);
// router.get("/:usersid",controller.getPersonalDetailsById);
// router.get ("/", controller.getAllUsers);
// router.delete("/:usersid", controller.deleteUserById);


module.exports = router;