const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload'); 

router.post('/', authGuard, roleGuard, upload.single('image'), productController.createProduct);
router.get('/', productController.getProducts);
router.put('/:id', authGuard, roleGuard, productController.updateProduct);
router.delete('/:id', authGuard, roleGuard, productController.deleteProduct);

module.exports = router;