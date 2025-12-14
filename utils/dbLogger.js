const db = require('../db');

/**
 * 1. Log Business Actions (Logins, Orders, Cancellations)
 * @param {number|null} user_id - The user ID (or null if unknown)
 * @param {string} level - 'INFO', 'WARNING', 'SUCCESS'
 * @param {string} message - Description
 * @param {string} url - The URL accessed
 */
exports.logAction = async (user_id, level, message, url) => {
    try {
        const query = `
            INSERT INTO system_logs (user_id, log_level, message, url_accessed)
            VALUES ($1, $2, $3, $4)
        `;
        await db.query(query, [user_id || null, level, message, url]);
    } catch (err) {
        console.error("DB Action Logging failed:", err.message);
    }
};

/**
 * 2. Log Technical Errors (UPDATED)
 * @param {number|null} user_id - The user ID (or null)
 * @param {string} errorType - The name of the error (e.g., TypeError)
 * @param {string} message - The error message
 * @param {string} stack - The technical stack trace
 * @param {string} url - The URL where it happened
 */
exports.logError = async (user_id, errorType, message, stack, url) => {
    try {
        const query = `
            INSERT INTO system_logs (user_id, log_level, message, url_accessed)
            VALUES ($1, 'ERROR', $2, $3)
        `;
        
        // Requirement: Log Error Type. 
        // We combine Type, Message, and Stack into the message column.
        const fullMessage = `[${errorType}] ${message} | Stack: ${stack ? stack.substring(0, 500) : 'No stack'}`;
        
        // Now passing user_id instead of hardcoded NULL
        await db.query(query, [user_id || null, fullMessage, url]);
    } catch (err) {
        console.error("DB Error Logging failed:", err.message);
    }
};