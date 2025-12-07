const Product = require('../models/Product');
const db = require('../db'); // <--- ADD THIS

exports.getProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createProduct = async (req, res) => {
    try {
        console.log("Uploaded File:", req.file);
        console.log("Form Body:", req.body);

        if (!req.body) {
            return res.status(400).json({ error: "Request body is empty" });
        }

        const { name, description, price, sku, category_id, brand_id } = req.body;
        
        // 1. Get the image path (if uploaded)
        // If on Windows, we might need to fix backslashes to forward slashes
        const image_url = req.file ? req.file.path.replace(/\\/g, "/") : null;

        // 2. Insert into Database
        const query = `
            INSERT INTO products (name, description, price, sku, category_id, brand_id, created_by, image_url, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `;
        
        // Note: req.user.id comes from authGuard
        const values = [name, description, price, sku, category_id, brand_id, req.user.id, image_url];
        
        const result = await db.query(query, values);
        
        res.status(201).json({ message: "Product created", product: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};