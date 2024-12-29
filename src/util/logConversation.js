// @ts-nocheck
const logger = require("../../logger");
const CONVERSATIONS = require("../models/conversation_model");

module.exports = async function createConversation(participants, message, type) {
  if (!Array.isArray(participants)) {
    process.env.NODE_ENV === "development" && logger.debug("participants must be an array:");

    throw new Error("participants must be an array");
  }

  if (!participants.length === 0) {
    process.env.NODE_ENV === "development" && logger.debug("participants array must not be empty:");

    throw new Error("participants array must not be empty");
  }

  const uniqueParticipants = [...new Set(participants.map(String))];

  if (!uniqueParticipants) {
    console.error("IDs provided must be unique", uniqueParticipants);
    return null;
  }

  if (uniqueParticipants.length < 2) {
    process.env.NODE_ENV === "development" &&
      console.error("Participants must include at least two IDs.", uniqueParticipants);

    return null;
  }

  try {
    // Check for existing conversation before creating another one
    const existingConversation = await CONVERSATIONS.findOne({
      participants: { $all: uniqueParticipants },
      type: "direct",
    });

    if (existingConversation) {
      process.env.NODE_ENV === "development" &&
        console.log("Found an existing conversation:", existingConversation);

      return existingConversation;
    }
    process.env.NODE_ENV === "development" &&
      console.log("Creating new conversation with participants:", uniqueParticipants);

    const newConversation = new CONVERSATIONS({
      participants: uniqueParticipants,
      type: type || "direct",
      lastMessage: null,
    });

    await newConversation.save();

    process.env.NODE_ENV === "development" &&
      logger.debug("Conversation created successfully:", newConversation);

    return newConversation;
  } catch (err) {
    logger.error("Error creating conversation:", err);
    return null;
  }
};
