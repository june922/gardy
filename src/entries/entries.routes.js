const express = require ('express');
const router = express.Router ();
const controller = require ('./entries.controller');

router.post ('/create', controller.createEntry);
router.get('/:entry_Id', controller.getEntryById);
router.get('/:houseId/entries', controller.getEntryByHouseId);
router.patch('/checkout/:entry_id', controller.updateEntryCheckOut);
router.patch('/checkin/:entry_id', controller.updateCheckInDetails);
router.get("/" ,controller.getAllEntries);



module.exports = router;