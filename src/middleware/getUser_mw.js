const logger = require("../../logger");
const USER = require("../models/user_model");
module.exports = async function getUser_mw(req, res, next) {
  const id = req.params.id;

  console.log("idParam:", id);

  try {
    if (!id) return res.status(400).send("no param");

    const user = await USER.findById(id).select("-password ").sort("1");

    if (!user) return res.status(400).send("no such a user with the ID");

    req.user = user;

    next();
  } catch (err) {
    logger.error(err);
    next(err);
  }
};
