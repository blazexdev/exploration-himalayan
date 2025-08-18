const express = require('express');
const router = express.Router();
const trekController = require('../controllers/trekController');

router.get('/', trekController.getTreks);
router.post('/', trekController.addTrek);
router.put('/:id', trekController.updateTrek);
router.delete('/:id', trekController.deleteTrek);

module.exports = router;