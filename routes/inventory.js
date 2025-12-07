const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// Public Routes (Anyone can see categories/brands)
router.get('/categories', inventoryController.getCategories);
router.get('/brands', inventoryController.getBrands);

// Admin Routes (Only Admin can add/delete)
router.post('/categories', authGuard, roleGuard, inventoryController.createCategory);
router.delete('/categories/:id', authGuard, roleGuard, inventoryController.deleteCategory);

router.post('/brands', authGuard, roleGuard, inventoryController.createBrand);

module.exports = router;