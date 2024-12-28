const logger = require("../../logger");
const MESSAGE = require("../models/message_model");
const CONVERSATION = require("../models/conversation_model");

/**
 * Saves a message to the database and updates the last message of the conversation.
 *
 * @async
 * @function saveMessage
 * @param {string} content - The content of the message.
 * @param {mongoose.Types.ObjectId} sender - The ID of the sender.
 * @param {mongoose.Types.ObjectId} receiver - The ID of the receiver.
 * @param {mongoose.Types.ObjectId} conversationID - The ID of the conversation.
 * @returns {Promise<Object>} An object containing the updated conversation and the persisted message ID.
 * @throws Will throw an error if the message cannot be saved or the conversation cannot be updated.
 */
const mongoose = require("mongoose");

async function saveMessage(content, sender, receiver, conversationID) {
  try {
    const message = new MESSAGE({
      content,
      sender,
      receiver,
      conversationID,
    });

    if (!message) throw new Error("unable to save message");

    await message.save();

    //update the conversation last message
    const conversationLastMessage = CONVERSATION.findByIdAndUpdate(
      conversationID,
      { lastMessage: message._id },
      { new: true }
    );

    if (!conversationLastMessage) throw new Error("conversation last message failed to be updated");

    logger.info("Message saved and lastMessage updated successfully!");

    return { conversationLastMessage, persistedMessageID: message?._id };
  } catch (err) {
    logger.error("Error saving message or updating conversation:", err);
    throw err;
  }
}

module.exports = saveMessage;
