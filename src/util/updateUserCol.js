// @ts-nocheck
const logger = require("../../logger");
const USER = require("../models/user_model");
/**
 * Updates a specified property of a user document in the database.
 *
 * @param {string} property - The property of the user document to update.
 * @param {*} value - The new value to set for the specified property.
 * @param {string} userID - The ID of the user document to update.
 * @returns {Promise<Object>} The updated user document.
 * @throws {Error} If an error occurs during the update process.
 */
async function updateUser_collection(property, value, userID) {
  try {
    const user = await USER.findById(userID);

    if (user) user.property = value;

    await user.save();

    return user;
  } catch (err) {
    logger.error(err.message);
  }
}

module.exports = updateUser_collection;
