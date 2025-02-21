const message_model = require("../models/message_model");
const deliverMessage = require("./deliverMessage");
const createConversation = require("./logConversation");
const saveMessage = require("./logMessage");
const { eventEmitter } = require("../util/webSocket");

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
  try {
    // Step 1: Persist or retrieve an existing conversation
    const conversation = await createConversation([userID, recipientID], type);
    if (!conversation) {
      throw new Error("Failed to create conversation, something went wrong");
    }

    const conversation_ID = conversation._id;

    // Step 2: Prepare message payload
    const newMessage = {
      sender: userID,
      content,
      event: "newMessage",
      receiver: recipientID,
      read: false,
      delivered: false,
      createdAt: Date.now(),
      conversationID: conversation_ID,
    };

    //Check if recipient is online Deliver real-time message
    if (ActiveConnections.has(recipientID)) {
      const deliverySuccess = deliverMessage(
        recipientID,
        { newMessage, event: "newMessage", code: 200 },
        ActiveConnections
      );

      if (deliverySuccess) {
        const messageID = (
          await saveMessage(content, userID, recipientID, conversation_ID, false, true)
        ).persistedMessageID;

        //notify the sender about their success message delivery
        deliverMessage(
          userID,
          {
            event: "messageDelivered",
            message: "Message successfully sent and delivered!",
            code: 200,
            messageID,
          },
          ActiveConnections
        );

        return;
      }
    }

    // Save message as "Sent but Not Delivered" (Recipient Offline)
    const { persistedMessageID } = await saveMessage(
      content,
      userID,
      recipientID,
      conversation_ID,
      false,
      false
    );

    deliverMessage(
      userID,
      {
        event: "messageNotDelivered",
        message: "Message sent but not delivered",
        code: 205,
        messageID: persistedMessageID,
      },
      ActiveConnections
    );

    //  Listen for recipient coming online to deliver the pending message
    eventEmitter.on("isBackOnline", async (onlineUserID) => {
      if (onlineUserID === recipientID) {
        const clientSocket = ActiveConnections.get(recipientID);
        if (!clientSocket) return;

        // Fetch and send pending messages
        const pendingMessages = await message_model.find({ recipientID, delivered: false });
        pendingMessages.forEach(async (message) => {
          clientSocket.send(JSON.stringify(message));

          // Mark as delivered in the database
          await message_model.findByIdAndUpdate(message._id, { delivered: true });

          // Notify the sender about delivery
          deliverMessage(
            userID,
            {
              event: "messageDelivered",
              message: "Message has been delivered!",
              code: 200,
              messageID: message._id,
            },
            ActiveConnections
          );
        });
      }
    });
  } catch (error) {
    console.error("Error handling new message:", error.message);
  }
};

module.exports = handleNewMessage;
