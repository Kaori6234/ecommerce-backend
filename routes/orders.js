const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

router.post('/checkout', authGuard, orderController.checkout);
router.get('/history', authGuard, orderController.getHistory);

router.get('/admin/all', authGuard, roleGuard, orderController.getAllOrders);
router.put('/admin/:order_id', authGuard, roleGuard, orderController.updateStatus);

module.exports = router;