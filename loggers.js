const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create a write stream for logs (in append mode)
const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

const customLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'eventLogs.log'), { flags: 'a' });

const logEvent =  (message) => {
    const timestamp = new Date().toISOString();
    customLogStream.write(`[${timestamp}] ${message}\n`);
}

const logAccess = (message) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${message}\n`);
};

module.exports = {
    logEvent,
    logAccess,
    logStream
};
