// @ts-nocheck
const logger = require("../../logger");
const MESSAGE = require("../models/message_model");

/**
 * Retrieves a specific conversation's messages, with pagination support.
 *
 * @param {string} conversationID - The ID of the conversation to retrieve messages for.
 * @param {number} [page=1] - The page number to retrieve (default is 1).
 * @param {number} [limit=20] - The number of messages to retrieve per page (default is 20).
 * @returns {Promise<Message[]>} - An array of message objects for the specified conversation.
 */
const retrieveSpecificConvMsg = async (conversationID, page = 1, limit = 20) => {
  if (!conversationID && !page && !limit) {
    logger.error("parameters are undefined");
    throw new Error("no parameters provided");
  }

  if (typeof page !== "number" && typeof limit !== "number") {
    logger.error("page and limit are not of type NUMBER");
    throw new Error("either LIMIT or PAGE is a string and it expects a number");
  }

  return await MESSAGE.find({ conversationID })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
};

module.exports = retrieveSpecificConvMsg;
