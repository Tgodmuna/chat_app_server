const jwt = require("jsonwebtoken");
const saveMessage = require("./logMessage");
const createConversation = require("./logConversation");
const EventEmitter = require("events");
const logger = require("../../logger");
const updateUser_collection = require("./updateUserCol");
const validateToken = require("./validateToken");
const deliverMessage = require("./deliverMessage");
const handleNewMessage = require("./handleNewMessage");
const eventEmitter = new EventEmitter();

function WebSocketServer(wss) {
  const ActiveConnections = new Map();

  //websocket connection
  wss.on("connection", (socket, req) => {
    try {
      const token = req.headers["x-auth-token"];
      const decoded = validateToken(token);

      const userID = decoded._id;

      ActiveConnections.set(userID, socket);

      logger.info(`User ${userID} connected.`);

      socket.on("message", async (data) => {
        try {
          const { recipientID, content, type } = JSON.parse(data);
          console.log("message as data", recipientID, content, type);

          await handleNewMessage(userID, recipientID, content, type, ActiveConnections);
        } catch (err) {
          socket.send(err.message);
          logger.error("Error processing message:", err);
        }
      });

      socket.on("close", () => {
        ActiveConnections.delete(userID);
        updateUser_collection("lastSeen", Date.now(), userID);
        logger.info(`User ${userID} disconnected.`);
      });
    } catch (err) {
      socket.send(JSON.stringify({ event: "error", message: err.message }));
      logger.error(err.message);
      socket.terminate();
    }
  });

  // Event Listeners for Other Notifications
  eventEmitter.on("friendRequestSent", (recipientID) => {
    deliverMessage(
      recipientID,
      {
        event: "friendRequestSent",
        message: "You have a new friend request!",
      },
      ActiveConnections
    );
  });

  eventEmitter.on("friendRequestAccepted", (requesterID) => {
    deliverMessage(
      requesterID,
      {
        event: "friendRequestAccepted",
        message: "Your friend request was accepted!",
      },
      ActiveConnections
    );
  });

  eventEmitter.on("userBlocked", (userID) => {
    deliverMessage(
      userID,
      {
        event: "userBlocked",
        message: "You have been blocked.",
      },
      ActiveConnections
    );
  });

  eventEmitter.on("messageRead", (userID) => {
    deliverMessage(
      userID,
      { event: "messageRead", message: "Message read.", status: true },
      ActiveConnections
    );
  });
}

module.exports = { WebSocketServer, eventEmitter };
