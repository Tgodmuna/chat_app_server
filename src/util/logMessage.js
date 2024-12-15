const logger = require("../../logger");
const MESSAGE = require("../models/message_model");
const CONVERSATION = require("../models/conversation model_model");

async function saveMessage(content, sender, receiver, conversationID) {
  try {
    const message = new MESSAGE( {
      content,
      sender,
      receiver,
      conversationID,
    } );

    await message.save();

    //update the conversation last message
    const updatedLastMessage = CONVERSATION.findByIdAndUpdate(
      { _id: conversationID },
      { lastMessage: message._id },
      { new: true }
    );

    logger.info("Message saved and lastMessage updated successfully!");

    return updatedLastMessage;
  } catch (err) {
    logger.error("Error saving message or updating conversation:", err);
    throw err;
  }
}

module.exports = saveMessage;
