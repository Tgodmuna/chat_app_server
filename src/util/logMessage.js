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
  * @param {number} ID - manually created ID for each message.

 * @returns {Promise<Object>} An object containing the updated conversation and the persisted message ID.
 * @throws Will throw an error if the message cannot be saved or the conversation cannot be updated.
 */
const mongoose = require("mongoose");

async function saveMessage(content, sender, receiver, conversationID, read, delivered, ID) {
  if (!content || !sender || !receiver || !conversationID) {
    throw new Error("All parameters must be provided and valid.");
  }

  if (
    !mongoose.Types.ObjectId.isValid(sender) ||
    !mongoose.Types.ObjectId.isValid(receiver) ||
    !mongoose.Types.ObjectId.isValid(conversationID)
  ) {
    throw new Error("Invalid ObjectId provided.");
  }

  try {
    const message = new MESSAGE({
      content,
      sender,
      receiver,
      conversationID,
      read,
      delivered,
      ID,
    });

    if (!message) throw new Error("unable to save message");

    await message.save();

    //update the conversation last message
    const conversationLastMessage = await CONVERSATION.findOne({ _id: conversationID });
    if (conversationLastMessage) {
      conversationLastMessage.lastMessage = message._id;

      await conversationLastMessage.save();
    }

    if (!conversationLastMessage) throw new Error("conversation last message failed to be updated");

    process.env.NODE_ENV === "development" &&
      logger.info("Message saved and lastMessage updated successfully!:", conversationLastMessage);

    return { conversationLastMessage, persistedMessageID: message?._id };
  } catch (err) {
    logger.error("Error saving message or updating conversation:", err);

    throw err;
  }
}

module.exports = saveMessage;
