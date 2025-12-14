const db = require('../db');

// 1. БҮТЭЭГДЭХҮҮН НЭМЭХ (CREATE)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, sku, category_id, brand_id } = req.body;
        // Зураг оруулсан эсэхийг шалгах
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const newProduct = await db.query(
            'INSERT INTO products (name, description, price, sku, category_id, brand_id, image_url, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, description, price, sku, category_id, brand_id, image_url, req.user.id]
        );

        res.status(201).json({ message: "Product created", product: newProduct.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 2. БҮТЭЭГДЭХҮҮН ЖАГСААХ (READ)
exports.getProducts = async (req, res) => {
    try {
        const products = await db.query('SELECT * FROM products ORDER BY date_added DESC');
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. БҮТЭЭГДЭХҮҮН ЗАСАХ (UPDATE) - ШИНЭЭР НЭМЭХ
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category_id, is_active } = req.body;

        const result = await db.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, category_id = $4, is_active = $5, modified_at = NOW() 
             WHERE product_id = $6 RETURNING *`,
            [name, description, price, category_id, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated", product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. БҮТЭЭГДЭХҮҮН УСТГАХ (DELETE) - ШИНЭЭР НЭМЭХ
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Шууд устгах (Хэрэв захиалганд орсон бол алдаа заана)
        const result = await db.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        // Хэрэв гадаад түлхүүрийн алдаа гарвал (захиалганд байгаа барааг устгах гэж оролдох үед)
        if (err.code === '23503') { 
            return res.status(400).json({ message: "Cannot delete product because it is part of an order." });
        }
        res.status(500).json({ error: err.message });
    }
};