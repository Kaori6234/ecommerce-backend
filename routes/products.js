const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload'); 

router.post('/',
    authGuard,
    roleGuard,
    upload.single('image'), // <--- This MUST be here
    productController.createProduct
);

router.get('/', productController.getProducts);

module.exports = router;