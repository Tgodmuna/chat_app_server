const logger = require("../../logger");
const MESSAGE = require("../models/message_model");

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
