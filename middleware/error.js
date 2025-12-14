const fs = require('fs');
const path = require('path');
const { logError } = require('../utils/dbLogger'); 

function errorHandler(err, req, res, next) {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const date = new Date().toISOString().slice(0, 10);
    const logFile = path.join(logDir, `errors-${date}.log`);

    const message = 
        `[${new Date().toISOString()}] ${err.name}: ${err.message}\n` +
        `User ID: ${req.user ? req.user.id : 'Guest'}\n` + 
        `URL: ${req.method} ${req.url}\n` +
        `Stack:\n${err.stack}\n\n`;

    fs.appendFile(logFile, message, (error) => {
        if (error) console.error("File log write error:", error);
    });

    if (logError) {
        const userId = req.user ? req.user.id : null;
        
        logError(userId, err.name, err.message, err.stack, req.originalUrl);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

module.exports = errorHandler;