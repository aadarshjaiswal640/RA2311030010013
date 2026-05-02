const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs.txt");

function log(message) {
  const time = new Date().toISOString();
  const logMessage = `[${time}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage);
}

module.exports = log;