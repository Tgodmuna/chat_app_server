const winston = require("winston");

const logger = winston.createLogger({
  level: "warn",
  format: winston.format.combine(
    winston.format.printf((value) => {
      return `{
        message: ${value.message},
        level: ${value.level},
        time: ${winston.format.timestamp()},
      }`;
    }),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true }),
    winston.format.align()
  ),

  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "general.log" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

module.exports = logger;
