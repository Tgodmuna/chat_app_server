// @ts-nocheck
const logger = require("../../logger");
const USER = require("../models/user_model");
async function updateDB(property, value, userID) {
  try {
    const user = await USER.findById(userID);

    if (user) user.property = value;

    await user.save();

    return user;
  } catch (err) {
    logger.error(err.message);
  }
}

module.exports = updateDB;
