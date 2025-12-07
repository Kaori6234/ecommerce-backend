const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { logAction } = require('../utils/dbLogger');
const sendEmail = require('../utils/emailService');
const db = require('../db');


exports.checkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { shipping_address_id } = req.body;
        const userResult = await db.query('SELECT email FROM users WHERE user_id = $1', [req.user.id]);
        const userEmail = userResult.rows[0].email;

        // 1. Get Cart Items
        const items = await Cart.getCartForCheckout(user_id);
        
        if (items.length === 0) {
            return res.status(400).json({ messazge: "Cart is empty" });
        }

        // 2. Calculate Total
        let total = 0;
        for (const item of items) {
            total += Number(item.price) * item.quantity;
        }

        // 3. Create Order
        const newOrder = await Order.createOrder(user_id, total, shipping_address_id);

        // 4. Move items to Order Items table
        await Order.addOrderItems(newOrder.order_id, items);

        // 5. Clear Cart
        await Order.clearCart(items[0].cart_id);

        

        res.status(201).json({ message: "Order placed successfully", order_id: newOrder.order_id });

        await logAction(user_id, "ORDER_PLACED", `Order ID: ${newOrder.order_id} - Total: ${total}`);

        await sendEmail(
            userEmail,
            "Захиалгыг хүлээж авлаа",
            `Таны #${newOrder.order_id} захиалга байршуулагдлаа`
        );

        res.status(201).json({ message: "Order placed", order_id: newOrder.order_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const orders = await Order.getHistory(req.user.id);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;

        // Validation: Ensure status is one of the allowed DB ENUM values
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedOrder = await Order.updateStatus(order_id, status);
        if (status === 'Cancelled') {
            await logAction(
                req.user.id, 
                'WARNING', 
                `Order #${order_id} was CANCELLED by Admin`, 
                `/api/orders/${order_id}`
            );
        } else {
             await logAction(
                req.user.id, 
                'INFO', 
                `Order #${order_id} status changed to ${status}`, 
                `/api/orders/${order_id}`
            );
        }
        
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};