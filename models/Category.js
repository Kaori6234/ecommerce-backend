const db = require('../db');

class Category {
    static async getAll() {
        const result = await db.query('SELECT * FROM categories');
        return result.rows;
    }

    static async create(name) {
        const result = await db.query(
            'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM categories WHERE category_id = $1', [id]);
    }
}
module.exports = Category;