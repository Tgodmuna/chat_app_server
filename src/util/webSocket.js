const EventEmitter = require("events");
const logger = require("../../logger");
const validateToken = require("./validateToken");
const deliverMessage = require("./deliverMessage");
const handleNewMessage = require("./handleNewMessage");
const eventEmitter = new EventEmitter();
const url = require("node:url");
const user_model = require("../models/user_model");
const message_model = require("../models/message_model");

function WebSocketServer(wss) {
  const ActiveConnections = new Map();

  //websocket connection
  wss.on("connection", async (socket, req) => {
    try {
      const query = url.parse(req.url, true).query;
      if (typeof query.token !== "string" || !query.token) {
        throw new Error("Invalid token type");
      }
      const decoded = validateToken(query.token);
      const userID = decoded._id;

      ActiveConnections.set(userID, socket);
      console.log("user connected:", userID);

      logger.info(`User ${userID} connected.`);
      eventEmitter.emit("userOnline", userID, socket);
      eventEmitter.emit("isBackOnline", userID);

      socket.on("message", async (data) => {
        try {
          const { recipientID, content, type, messageID, event } = JSON.parse(data);
          console.log("received socket data:", JSON.parse(data));

          switch (event) {
            case "messageRead":
              console.log("received read event:", JSON.parse(data));

              let messageToUpdate = await message_model.findOne({ ID: messageID, read: false });

              if (!messageToUpdate) {
                console.log("no document found");
                return;
              }

              messageToUpdate.read = true;
              await messageToUpdate.save();

              const updatedMessage = await message_model.findOne({ ID: messageID });

              // Send back the updated message
              const success = deliverMessage(
                recipientID,
                {
                  event: "messageRead",
                  messageID,
                  time: Date.now(),
                  data: updatedMessage,
                },
                ActiveConnections
              );
              if (success) console.log(`✅ Update sent to recipient: ${recipientID}`);
              else {
                console.log(`❌ Failed to deliver update to recipient: ${recipientID}`);
                eventEmitter.emit("isBackOnline", recipientID);
              }

              break;

            case "newMessage":
              console.log("recieved new message event:", JSON.parse(data));
              await handleNewMessage(
                messageID,
                userID,
                recipientID,
                content,
                type,
                ActiveConnections
              );
              break;

            default:
              break;
          }
        } catch (err) {
          socket.send(err.message);
          logger.error("Error processing message:", err);
        }
      });

      socket.on("close", async () => {
        ActiveConnections.delete(userID);
        logger.info(`User ${userID} disconnected.`);
        eventEmitter.emit("userOffline", userID, socket);
      });
    } catch (err) {
      socket.send(JSON.stringify({ event: "error", message: err.message }));
      logger.error(err.message);
      socket.terminate();
    }
  });

  //event for userOnline presence update
  eventEmitter.on("userOnline", async (userID, socket) => {
    try {
      let onlineUser = await user_model
        .findOneAndUpdate({ _id: userID }, { $set: { isOnline: true } }, { new: true })
        .select("isOnline  name username _id");

      //respond with the updated document
      socket.send(JSON.stringify({ event: "onLine", onlineUser }));
    } catch (err) {
      logger.error(`Error updating user ${userID} online status:`, err);
    }
  });

  //event for userOffline presence update
  eventEmitter.on("userOffline", async (userID, socket) => {
    try {
      const offlineUser = await user_model
        .findOneAndUpdate(
          { _id: userID },
          { $set: { isOnline: false, lastSeen: Date.now() } },
          { new: true }
        )
        .select("isOnline name username _id");

      socket.send(JSON.stringify({ event: "onLine", offlineUser }));
    } catch (err) {
      logger.error(`Error updating user ${userID} online status:`, err);
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

    //remember to send an email reminder
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

  eventEmitter.on("messageDelivered", (userID) => {
    deliverMessage(
      userID,
      {
        event: "deliverd",
        message: "message delivered",
      },
      ActiveConnections
    );
  });
}

module.exports = { WebSocketServer, eventEmitter };
