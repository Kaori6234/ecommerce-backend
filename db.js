const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
// 1. If running on Vercel, use POSTGRES_URL
// 2. If running locally, use individual DB_ variables
const pool = process.env.POSTGRES_URL
    ? new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false // Required for Vercel/Neon DBs
        }
    })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};