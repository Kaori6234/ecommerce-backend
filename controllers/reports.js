const db = require('../db');

// Get items in carts that are older than 24 hours (Abandoned)
exports.getAbandonedCarts = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.email,
                u.first_name,
                p.name as product_name,
                ci.quantity,
                sc.created_date as cart_created_at
            FROM shopping_cart sc
            JOIN cart_items ci ON sc.cart_id = ci.cart_id
            JOIN products p ON ci.product_id = p.product_id
            JOIN users u ON sc.user_id = u.user_id
            -- Logic: Show items in cart where created_date is older than 24 hours
            WHERE sc.created_date < NOW() - INTERVAL '1 day'
        `;
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get System Logs (To see the errors/cancellations we logged earlier)
exports.getSystemLogs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM system_logs ORDER BY log_date DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};