const logger = require("../../logger");
const MESSAGE = require("../models/message_model");

async function deleteMessage(messageID) {
  if (!messageID) {
    logger.error("user failed to provide messageID");
    throw new Error("messageID is required");
  }

  await MESSAGE.findByIdAndDelete(messageID);
  logger.info("message deleted successfully");

  return;
}

module.exports = deleteMessage;
