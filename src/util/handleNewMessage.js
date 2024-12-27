/**
 * Handles the process of receiving a new message, including delivering the message in real-time if the recipient is online,
 * creating a conversation log, and saving the message to the database.
 *
 * @param {string} userID - The ID of the user sending the message.
 * @param {string} recipientID - The ID of the recipient receiving the message.
 * @param {string} content - The content of the message being sent.
 * @param {string} type - The type of the conversation (e.g., "text", "image").
 * @param {Object} ActiveConnections - An object representing the active connections of users.
 * @returns {Promise<void>} A promise that resolves when the message handling process is complete.
 */
const deliverMessage = require("./deliverMessage");
const createConversation = require("./logConversation");
const saveMessage = require("./logMessage");


const handleNewMessage = async (userID, recipientID, content, type, ActiveConnections) => {
  // Persist the conversation
  const conversation = await createConversation([userID, recipientID], type);
  const convoID = conversation._id;

  // Deliver real-time message if recipient is online
  if (
    deliverMessage(
      recipientID,
      {
        sender: userID,
        content: content,
        event: "received new message",
      },
      ActiveConnections
    )
  ) {
    // Notify the sender their message was sent
    deliverMessage(
      userID,
      {
        event: "messageSent",
        message: "Message successfully sent!",
      },
      ActiveConnections
    );
    await saveMessage(content, userID, recipientID, convoID);
  }

  //if message failed to deliver because user was not online.save it to the DB
  if (!deliverMessage) {
    await saveMessage(content, userID, recipientID, convoID);
    return;
  }
};

module.exports = handleNewMessage;
