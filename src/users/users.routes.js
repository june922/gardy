const express = require ('express');
const router = express.Router ();
const controller = require ('./users.controller');
 
const authMiddlewares = require('../../middleware/authJwt');
router.post ('/create', controller.createUser);
router.patch ("/:usersid/update", controller.updatePersonalDetails);

router.get("/:usersid", 
  [authMiddlewares.verifyToken, authMiddlewares.isActive, authMiddlewares.isMyDataOrEstateAdmin],
  controller.getPersonalDetailsById
);
router.get ("/", controller.getAllUsers);
router.delete("/:usersid", controller.deleteUserById);


module.exports = router;