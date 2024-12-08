const jwt = require("jsonwebtoken");
const blackList = require("../util/token_Blacklist");

module.exports = function verifyToken_mw(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  //check if the token has been blacklisted
  if (blackList().has(token)) {
    return res.status(401).send("token has been invalidated");
  }

  try {
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.jwtsecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
    next(err);
  }
};
