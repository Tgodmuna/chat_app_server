// @ts-nocheck
const token_Blacklist = require("../util/token_Blacklist");
const jwt = require("jsonwebtoken");
module.exports = function authorised_mw(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("access denied.not authorised, no token provided");

  if (!jwt.verify(token, process.env.jwtsecret))
    return res.status(401).send("invalid token, provide a valid token");

  next();
};
