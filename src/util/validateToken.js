//token validator

const logger = require("../../logger");
const jwt = require("jsonwebtoken");

/**
 * Validates the provided JWT token and returns the decoded payload.
 *
 * @param {string} token - The JWT token to be validated.
 * @returns {object} The decoded payload of the JWT token.
 * @throws {Error} If the token is missing or invalid.
 */
const validateToken = (token) => {
  if (!token) {
    logger.error("Missing token, cannot establish WebSocket connection.");
    throw new Error("Missing token");
  }
  const secret = process.env.jwtsecret;
  if (!secret) {
    logger.error("JWT secret is not defined.");
    throw new Error("JWT secret is not defined");
  }
  const hasExpired = jwt.verify(token, secret);

  if (!hasExpired) {
    logger.error("Token is expired");
    throw new Error("Token is expired");
  }
  return jwt.verify(token, secret);
};

module.exports = validateToken;
