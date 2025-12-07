const db = require('../db');

class User {
    static async create({ email, password_hash, first_name, last_name, phone_number, role }) {
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, email, role, first_name, last_name;
        `;
        const values = [email, password_hash, first_name, last_name, phone_number, role || 0];
        
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }
}

module.exports = User;