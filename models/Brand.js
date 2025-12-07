const db = require('../db');

class Brand {
    static async getAll() {
        const result = await db.query('SELECT * FROM brands');
        return result.rows;
    }

    static async create(name) {
        const result = await db.query(
            'INSERT INTO brands (brand_name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM brands WHERE brand_id = $1', [id]);
    }
}
module.exports = Brand;