// @ts-nocheck
const { isValidObjectId } = require("mongoose");
const CONVERSATION = require("../models/conversation_model");
const logger = require("../../logger");

/**
 * Retrieves user conversations from the database.
 *
 * @param {string} participant - The ID of the participant whose conversations should be retrieved.
 * @returns {Promise<Conversation[]>} - An array of conversation objects.
 * @throws {Error} - If the provided participant ID is not a valid MongoDB ObjectID.
 */
async function retrieveUserConversations(participant) {
  try {
    if (!participant || !isValidObjectId(participant)) {
      logger.error("The provided parameter expects to be a valid MongoDB ObjectID");
      throw new Error("Not a valid database ID");
    }

    const conversations = await CONVERSATION.find({ participants: participant })
      .sort({ updatedAt: -1 })
      .populate(["participants", "lastMessage"])
      .exec();

    logger.info("Conversations successfully returned");
    return conversations;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = retrieveUserConversations;
