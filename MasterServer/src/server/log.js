const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../log.txt');

function logMessage(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp}: ${message}\n`;

    fs.appendFile(logFilePath, formattedMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
}

module.exports = { logMessage };