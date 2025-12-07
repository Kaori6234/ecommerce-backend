const db = require('../db');

class Order {
    // Create the main Order record
    static async createOrder(user_id, total_amount, shipping_address_id) {
        const query = `
            INSERT INTO orders (user_id, total_amount, shipping_address_id, status)
            VALUES ($1, $2, $3, 'Pending')
            RETURNING order_id
        `;
        const result = await db.query(query, [user_id, total_amount, shipping_address_id]);
        return result.rows[0];
    }

    // Move items from Cart to Order Items
    static async addOrderItems(order_id, cartItems) {
        for (const item of cartItems) {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)`,
                [order_id, item.product_id, item.quantity, item.price] 
                // Note: We assume 'item.price' comes from the cart query
            );
        }
    }

    // Clear User's Cart
    static async clearCart(cart_id) {
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart_id]);
    }

    static async getAllOrders() {
        const query = `
            SELECT o.order_id, o.total_amount, o.status, o.order_date, 
                   u.email, u.first_name, u.last_name
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            ORDER BY o.order_date DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }
    
    // Get Order History
    static async getHistory(user_id) {
        const query = `
            SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    static async updateStatus(order_id, status) {
        const query = `
            UPDATE orders 
            SET status = $1, modified_at = NOW()
            WHERE order_id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, order_id]);
        return result.rows[0];
    }
}

module.exports = Order;