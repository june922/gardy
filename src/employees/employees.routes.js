const express = require ('express');
const router = express.Router ();
const controller = require ('./employees.controller');
const { get } = require('../../middleware/emailtransporter');

router.post ('/create', controller.addEmployees);
router.patch ("/:employeeid/update", controller.updateEmployeeDetails);
router.get ("/:employeeid",controller.getById);
router.get ("/", controller.getAllEmployees);
router.get ("/:estateid", controller.getByEstateId);
router.delete("/:id", controller.deleteEmployeesById);


module.exports = router;