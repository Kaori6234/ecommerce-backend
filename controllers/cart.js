const Cart = require('../models/Cart');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user.id; // From Auth Token

        // 1. Ensure user has a cart
        const cart = await Cart.findOrCreateCart(user_id);

        // 2. Add item
        await Cart.addItem(cart.cart_id, product_id, quantity || 1);

        res.json({ message: "Item added to cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Cart
exports.viewCart = async (req, res) => {
    try {
        const items = await Cart.getItems(req.user.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove Item
exports.removeItem = async (req, res) => {
    try {
        await Cart.removeItem(req.params.id);
        res.json({ message: "Item removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};