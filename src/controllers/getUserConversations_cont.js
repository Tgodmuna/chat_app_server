const { isValidObjectId } = require("mongoose");
const CONVERSATION = require("../models/conversation model_model");
const logger = require("../../logger");
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
