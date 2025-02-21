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
const retrieveSpecificConvMsg = async (conversationID, page = 1, limit = 10) => {
  if (!conversationID && !page && !limit) {
    logger.error("parameters are undefined");
    throw new Error("no parameters provided");
  }

  if (typeof page !== "number" && typeof limit !== "number") {
    logger.error("page and limit are not of type NUMBER");
    logger.info("converting page and limits to number type.......");

    let convertedPage, ConvertedLimit;
    convertedPage = parseInt(page);
    ConvertedLimit = parseInt(limit);

    logger.info("converted to number type", { convertedPage, ConvertedLimit });

    const messages = await MESSAGE.find({ conversationID })
      .populate({
        path: "sender receiver",
        select:
          "-password -email -__v -interests -role -bio -profilePicture  -location -friend -age -friendRequestList -phone",
        model: "User",
      })
      .sort({ createdAt: -1 })
      .skip((convertedPage - 1) * ConvertedLimit)
      .limit(limit)
      .exec();

    return messages.reverse();
  }

  const messages = await MESSAGE.find({ conversationID })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return messages.reverse();
};

module.exports = retrieveSpecificConvMsg;
