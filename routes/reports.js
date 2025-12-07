const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// Only Admins can see these reports
router.get('/abandoned-carts', authGuard, roleGuard, reportController.getAbandonedCarts);
router.get('/logs', authGuard, roleGuard, reportController.getSystemLogs);

module.exports = router;