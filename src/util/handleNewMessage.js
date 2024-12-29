const message_model = require("../models/message_model");
const deliverMessage = require("./deliverMessage");
const createConversation = require("./logConversation");
const saveMessage = require("./logMessage");

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

const handleNewMessage = async (userID, recipientID, content, type, ActiveConnections) => {
  // Persist the conversation
  const conversation = await createConversation([userID, recipientID], type);

  if (!conversation) {
    throw new Error("Failed to create conversation,something went wrong");
  }

  const conversation_ID = conversation?._id;

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
        event: "messageSent&Delivered",
        message: "Message successfully sent and delivered!",
        code: 200,
      },
      ActiveConnections
    );

    //persist the message also
    await saveMessage(content, userID, recipientID, conversation_ID);

    return;
  }

  //if message failed to deliver because user is not online, save it to the DB
  const { persistedMessageID } = await saveMessage(content, userID, recipientID, conversation_ID);
  deliverMessage(
    userID,
    { event: "Sent&NotDelivered", message: "sent and not delivered", code: 205 },
    ActiveConnections
  );

  //deliver the message if the user comesback online.
  if (ActiveConnections.has(recipientID)) {
    const clientSocket = ActiveConnections.get(recipientID);

    //fecth the saved messsage
    const persistedMessage = await message_model.findById(persistedMessageID);
    clientSocket.send(JSON.stringify(persistedMessage));

    //notify the sender their message has been delivered
    deliverMessage(
      userID,
      {
        event: "Delivered",
        message: `Message delivered to-${userID}`,
        code: 200,
      },
      ActiveConnections
    );

    return;
  }
};

module.exports = handleNewMessage;
