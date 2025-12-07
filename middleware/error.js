const fs = require('fs');
const path = require('path');
const { logError } = require('../utils/dbLogger'); // Import the DB Logger we made

function errorHandler(err, req, res, next) {
    // --- PART 1: LOG TO FILE (Folder) ---
    // Create the 'logs' folder if it doesn't exist
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    // Create a file name based on today's date (e.g., errors-2023-12-08.log)
    const date = new Date().toISOString().slice(0, 10);
    const logFile = path.join(logDir, `errors-${date}.log`);

    // Format the error message
    const message = 
        `[${new Date().toISOString()}] ERROR: ${err.message}\n` +
        `URL: ${req.method} ${req.url}\n` +
        `Stack:\n${err.stack}\n\n`;

    // Append (add) this error to the file
    fs.appendFile(logFile, message, (error) => {
        if (error) console.error("File log write error:", error);
    });

    // --- PART 2: LOG TO DATABASE (System Logs Table) ---
    // Save the technical error to your PostgreSQL database
    // We send: Message, Stack Trace, and the URL that caused it
    if (logError) {
        logError(err.message, err.stack, req.originalUrl);
    }

    // --- PART 3: RESPOND TO USER ---
    // Don't let the user wait forever; send them a clean error message
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

module.exports = errorHandler;