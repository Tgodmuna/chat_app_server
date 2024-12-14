// @ts-nocheck
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const updateUserCollection = require("./updateUser_collection");
const saveMessage = require("./logMessage");
const createConversation = require("./logConversation");
const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

function WebSocketServer(wss) {
  const ActiveConnections = new Map();

  //token validator
  /**
   * Validates the provided JWT token and returns the decoded payload.
   *
   * @param {string} token - The JWT token to be validated.
   * @returns {object} The decoded payload of the JWT token.
   * @throws {Error} If the token is missing or invalid.
   */
  const validateToken = (token) => {
    if (!token) {
      logger.error("Missing token, cannot establish WebSocket connection.");
      throw new Error("Missing token");
    }
    return jwt.verify(token, process.env.jwtsecret);
  };

  /**
   * Delivers a message to the recipient if they are currently connected to the WebSocket server.
   *
   * @param {string} recipientID - The ID of the recipient to whom the message should be delivered.
   * @param {object} data - The message data to be delivered.
   */
  const deliverMessage = (recipientID, data) => {
    if (ActiveConnections.has(recipientID)) {
      ActiveConnections.get(recipientID).send(JSON.stringify(data));
    } else {
      logger.info(`Recipient ${recipientID} is not online.`);
    }
  };

  /**
   * Handles the processing of a new message received over the WebSocket connection.
   *
   * This function is responsible for:
   * 1. Delivering the real-time message to the recipient if they are online.
   * 2. Persisting the conversation and message in the database.
   * 3. Notifying the sender that their message was successfully sent.
   *
   * @param {string} userID - The ID of the user who sent the message.
   * @param {string} recipientID - The ID of the recipient of the message.
   * @param {string} content - The content of the message.
   * @param {string} type - The type of the message (e.g. 'text', 'image', 'file').
   */
  const handleNewMessage = (userID, recipientID, content, type) => {
    // Deliver real-time message if recipient is online
    deliverMessage(recipientID, {
      sender: userID,
      content: content,
      event: "received new message",
    });

    // Persist the conversation and message
    createConversation([userID, recipientID], content, type);
    saveMessage(content, userID, recipientID);

    // Notify the sender their message was sent
    deliverMessage(userID, {
      event: "messageSent",
      message: "Message successfully sent!",
    });
  };

  //websocket connection
  wss.on("connection", (socket, req) => {
    try {
      const token = req.headers["x-auth-token"];
      const decoded = validateToken(token);
      const userID = decoded._id;

      ActiveConnections.set(userID, socket);

      logger.info(`User ${userID} connected.`);

      socket.on("message", (data) => {
        try {
          const { recipientID, content, type } = JSON.parse(data);
          handleNewMessage(userID, recipientID, content, type);
        } catch (err) {
          logger.error("Error processing message:", err.message);
        }
      });

      socket.on("close", () => {
        ActiveConnections.delete(userID);
        updateUserCollection({ lastSeen: Date.now() }, userID);
        logger.info(`User ${userID} disconnected.`);
      });
    } catch (err) {
      logger.error(err.message);
      socket.terminate();
    }
  });

  // Event Listeners for Other Notifications
  eventEmitter.on("friendRequestSent", (recipientID) => {
    deliverMessage(recipientID, {
      event: "friendRequestSent",
      message: "You have a new friend request!",
    });
  });

  eventEmitter.on("friendRequestAccepted", (requesterID) => {
    deliverMessage(requesterID, {
      event: "friendRequestAccepted",
      message: "Your friend request was accepted!",
    });
  });

  eventEmitter.on("userBlocked", (userID) => {
    deliverMessage(userID, {
      event: "userBlocked",
      message: "You have been blocked.",
    });
  });
}

module.exports = { WebSocketServer, eventEmitter };
