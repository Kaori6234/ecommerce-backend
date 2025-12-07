const db = require('../db');

class Product {
    static async getAll() {
        const query = `
            SELECT p.*, b.brand_name, c.category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async create({ name, description, price, sku, category_id, brand_id, created_by }) {
        const query = `
            INSERT INTO products (name, description, price, sku, category_id, brand_id, created_by, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING *
        `;
        const values = [name, description, price, sku, category_id, brand_id, created_by];
        const result = await db.query(query, values);
        return result.rows[0];
    }
    
    // Helper to add attributes like Size: XL or Color: Red
    static async addAttribute(product_id, value_id) {
        const query = `INSERT INTO product_attributes (product_id, value_id) VALUES ($1, $2)`;
        await db.query(query, [product_id, value_id]);
    }
}

module.exports = Product;