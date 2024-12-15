// @ts-nocheck
const { isValidObjectId } = require("mongoose");
const CONVERSATION = require("../models/conversation model_model");
const logger = require("../../logger");

/**
 * Retrieves user conversations from the database.
 *
 * @param {string} participant - The ID of the participant whose conversations should be retrieved.
 * @returns {Promise<Conversation[]>} - An array of conversation objects.
 * @throws {Error} - If the provided participant ID is not a valid MongoDB ObjectID.
 */
async function retrieveUSerConversations(participant) {
  try {
    if (participant && isValidObjectId(participant)) {
      logger.error("the provided parameter expects to be a valid mongo objectID");
      throw new Error("not a valid database id");
    }

    const conversations = await CONVERSATION.find({ participant })
      .sort({ upDateAt: -1 })
      .populate("lastMessage")
      .exec();

    logger.info("conversations successfully returned");
    return conversations;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = retrieveUSerConversations;
