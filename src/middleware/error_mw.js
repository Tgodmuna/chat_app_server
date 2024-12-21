const logger = require("../../logger");
const { ValidationError } = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function Error_mw(err, req, res, next) {
  logger.error(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: "Validation Error", details: err.details });
  }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token Expired" });
    }

    if (err instanceof jwt.NotBeforeError) {
      return res.status(401).json({ error: "Token Not Active" });
    }

  if (err instanceof mongoose.Error) {
    return res.status(500).json({ error: "Database Error", details: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = Error_mw;
