// @ts-nocheck
const tryCatch_mw = require("../middleware/tryCatch_mw");
const validateBody_mw = require("../middleware/validateBody_mw");
const register = require("../controllers/register_cont");
const router = require("express").Router();
const logger = require("../../logger");
const _ = require("lodash");
const login_cont = require("../controllers/login_cont");
const verifyToken_mw = require("../middleware/verifyToken_mw");
const jwt = require("jsonwebtoken");
const token_Blacklist = require("../util/token_Blacklist");
const BlackList = require("../models/blackList_model");

//register route
router.post("/register", [
  validateBody_mw,
  tryCatch_mw(async (req, res) => {
    // Check if user already exists
    const registrationResult = await register(req.body);

    if (registrationResult === "existing_user") {
      logger.warn("found an existing account, terminating registration....");
      return res.status(400).send("already existing account, sign in");
    }

    // Registration was successful
    logger.info("registration successful");
    return res.status(201).json({ user: registrationResult, message: "registered successfully" });
  }),
]);

//login route
router.post(
  "/sign-in",
  tryCatch_mw(async (req, res) => {
    const user = await login_cont(req.body);

    if (!user) return res.status(400).send("invalid email or password");

    const payload = _.pick(user, [
      "_id",
      "email",
      "name",
      "phone",
      "age",
      "location",
      "gender",
      "status",
      "role",
    ]);

    //generate token
    // @ts-ignore
    const token = jwt.sign(payload, process.env.jwtsecret, { expiresIn: "1h" });

    res.header("x-auth-token", token).status(200).json({ message: "login successful", user: user });

    logger.info("login successful");

    return;
  })
);

//logout route
router.post("/logout", [
  verifyToken_mw,
  tryCatch_mw(async (req, res) => {
    //black the list the token immediately
    let blacklisted = await new BlackList({ token: req.header("x-auth-token") }).save();

    if (!blacklisted) {
      logger.error("error in blacklisting a token");
      return;
    }

    logger.info("user logged out");
    return res.status(200).send("logout successful");
  }),
]);

//Get the currently authenticated user's profile (using JWT)
router.get(
  "/me",
  verifyToken_mw,
  tryCatch_mw(async (req, res) => {
    const token = req.header("x-auth-token");

    const user = req.user;

    res.status(200).json({ user });
    return;
  })
);

module.exports = router;
