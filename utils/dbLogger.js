const db = require('../db');

/**
 * 1. Log Business Actions (Logins, Orders, Cancellations)
 * @param {number|null} user_id - The user ID (or null if unknown)
 * @param {string} level - 'INFO', 'WARNING', 'SUCCESS'
 * @param {string} message - Description (e.g., "Failed login attempt")
 * @param {string} url - The URL accessed
 */
exports.logAction = async (user_id, level, message, url) => {
    try {
        const query = `
            INSERT INTO system_logs (user_id, log_level, message, url_accessed)
            VALUES ($1, $2, $3, $4)
        `;
        // Use user_id OR null
        await db.query(query, [user_id || null, level, message, url]);
    } catch (err) {
        // We use console.error here so we don't cause an infinite loop of errors
        console.error("DB Action Logging failed:", err.message);
    }
};

/**
 * 2. Log Technical Errors (Crashes, 500 Errors)
 * @param {string} message - The error message
 * @param {string} stack - The technical stack trace
 * @param {string} url - The URL where it happened
 */
exports.logError = async (message, stack, url) => {
    try {
        const query = `
            INSERT INTO system_logs (user_id, log_level, message, url_accessed)
            VALUES (NULL, 'ERROR', $1, $2)
        `;
        
        // Combine the message and the stack trace, but limit length to avoid huge database entries
        // We take the first 500 characters of the stack trace
        const fullMessage = `${message} | Stack: ${stack ? stack.substring(0, 500) : 'No stack'}`;
        
        await db.query(query, [fullMessage, url]);
    } catch (err) {
        console.error("DB Error Logging failed:", err.message);
    }
};