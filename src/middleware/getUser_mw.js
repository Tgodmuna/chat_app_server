const logger = require("../../logger");
const USER = require("../models/user_model");
module.exports = async function getUser_mw(req, res, next) {
  const id = req.param.id;

  try {
    const user = await USER.findById({ id }).select("name age profilePicture email bio").sort("1");

    if (!user) return res.status(400).send("no such a user with the ID");

    req.user = user;

    next();
  } catch (err) {
    logger.error(err);
    next(err);
  }
};
