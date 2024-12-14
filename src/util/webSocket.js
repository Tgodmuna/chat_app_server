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
  const validateToken = (token) => {
    if (!token) {
      logger.error("Missing token, cannot establish WebSocket connection.");
      throw new Error("Missing token");
    }
    return jwt.verify(token, process.env.jwtsecret);
  };

  const deliverMessage = (recipientID, data) => {
    if (ActiveConnections.has(recipientID)) {
      ActiveConnections.get(recipientID).send(JSON.stringify(data));
    } else {
      logger.info(`Recipient ${recipientID} is not online.`);
    }
  };

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
``
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
