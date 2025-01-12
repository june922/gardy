const express = require ('express');
const router = express.Router ();
const controller = require ('./entries.controller');

router.post ('/create', controller.createEntry);
router.get('/:entryId', controller.getEntryById);
router.get('/:userId/entries', controller.getEntryByUserId);

module.exports = router;