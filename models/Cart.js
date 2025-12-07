const db = require('../db');

class Cart {
    // 1. Get a user's cart (or create one if it doesn't exist)
    static async findOrCreateCart(user_id) {
        let result = await db.query('SELECT * FROM shopping_cart WHERE user_id = $1', [user_id]);
        
        if (result.rows.length === 0) {
            result = await db.query(
                'INSERT INTO shopping_cart (user_id) VALUES ($1) RETURNING *',
                [user_id]
            );
        }
        return result.rows[0];
    }

    // 2. Add item to cart
    static async addItem(cart_id, product_id, quantity) {
        // Check if item already exists in cart
        const existing = await db.query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cart_id, product_id]
        );

        if (existing.rows.length > 0) {
            // Update quantity
            const newQty = existing.rows[0].quantity + quantity;
            return db.query(
                'UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *',
                [newQty, existing.rows[0].cart_item_id]
            );
        } else {
            // Insert new item
            return db.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
                [cart_id, product_id, quantity]
            );
        }
    }

    // 3. Get all items in the cart (with Product details)
    static async getItems(user_id) {
        const query = `
            SELECT ci.cart_item_id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
            FROM cart_items ci
            JOIN shopping_cart sc ON ci.cart_id = sc.cart_id
            JOIN products p ON ci.product_id = p.product_id
            WHERE sc.user_id = $1
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    // 4. Remove item
    static async removeItem(cart_item_id) {
        await db.query('DELETE FROM cart_items WHERE cart_item_id = $1', [cart_item_id]);
    }
    static async getCartForCheckout(user_id) {
        const query = `
            SELECT ci.product_id, ci.quantity, p.price, sc.cart_id
            FROM cart_items ci
            JOIN shopping_cart sc ON ci.cart_id = sc.cart_id
            JOIN products p ON ci.product_id = p.product_id
            WHERE sc.user_id = $1
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }
}

module.exports = Cart;