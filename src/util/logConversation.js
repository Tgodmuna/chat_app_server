// @ts-nocheck
const logger = require("../../logger");
const CONVERSATIONS = require("../models/conversation_model");

async function createConversation(participants, message, type) {
  try {
    if (!Array.isArray(participants)) throw new Error("participants must be an array");

    //check for existing conversation before creating another one
    const existingConversation = await CONVERSATIONS.findOne({
      $or: [
        { participants: [participants.userID, participants.recipientID], type: "direct" },
        { participants: [participants.recipientID, participants.userID], type: "direct" },
      ],
    });

    if (existingConversation) return existingConversation;
    process.env.NODE_ENV = "development" && logger.debug("existing conversation:",existingConversation);

    const newConversation = new CONVERSATIONS({
      participants,
      type,
      lastMessage: null,
    });

    await newConversation.save();
    process.env.NODE_ENV = "development" && logger.debug("conversation created successfully");

    process.env.NODE_ENV === "development" &&
      logger.debug("new created conversation", newConversation);

    return newConversation;
  } catch (err) {
    logger.error(err);
  }
}

module.exports = createConversation;
