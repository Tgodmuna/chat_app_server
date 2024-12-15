// @ts-nocheck
const logger = require("../../logger");
const CONVERSATIONS = require("../models/conversation model_model");

async function createConversation(participants, message, type) {
  try {
    if (!Array.isArray(participants)) throw new Error("participants must be an array");

    //check for existing conversation before creating another one
    const existingConvo = await conversationModel_model.findOne({
      $or: [
        { participants: [participants.userID, participants.recipientID], type: "direct" },
        { participants: [participants.recipientID, participants.userID], type: "direct" },
      ],
    });

    if ( existingConvo ) return existingConvo;

    const convo = new CONVERSATIONS({
      participants,
      type,
      lastMessage: null,
    });

    return await convo.save();
  } catch (err) {
    logger.error(err);
  }
}

module.exports = createConversation;
