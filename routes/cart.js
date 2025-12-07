const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const authGuard = require('../middleware/authGuard');

// All cart actions require login
router.post('/', authGuard, cartController.addToCart);
router.get('/', authGuard, cartController.viewCart);
router.delete('/:id', authGuard, cartController.removeItem);

module.exports = router;