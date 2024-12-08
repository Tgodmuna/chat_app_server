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

//register route
router.post("/register", [
  validateBody_mw,
  tryCatch_mw(async (req, res) => {
    if ((await register(req.body)) === "exisiting_user") {
      logger.warn("found an existing account,terminating registration....");
      return res.status(400).send("already existing account,sign in");
    }

    //if not, proceed with the registration.
    const user = await register(req.body);
    logger.info("registration successful");
    return res.status(201).json({ user: user, message: "registered successfully" });
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
  })
);

//logout route
router.post("/logout", [
  verifyToken_mw,
  tryCatch_mw((_, res) => {
    return res.status(200).send("logout successful");
  }),
]);

//Get the currently authenticated user's profile (using JWT)
router.get(
  "/me",
  tryCatch_mw((req, res) => {
    const token = req.header("x-auth-token");

    const invalidated = token_Blacklist().has(token);

    if (invalidated) return res.status(401).send("user can not be validated");

    const decoded = jwt.verify(token, process.env.jwtsecret);
    const user = decoded;

    res.status(200).json({ user });
  })
);

module.exports = router;
