// @ts-nocheck
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const updateDB = require("./updateDB");

module.exports = function WebSocket(wss) {
  const validateToken = (token) => {
    if (!token) throw new Error("Missing token");
    logger.error("missing token, can not establish a websocket connection...");

    return jwt.verify(token, process.env.jwtsecret);
  };

  const Active_connections = new Map();

  wss.on("connection", (socket, req) => {
    try {
      const token = req.headers["x-auth-token"];
      const decoded = validateToken(token);
      const userID = decoded._id;

      if (!Active_connections.has(userID)) {
        Active_connections.set(userID, socket);
      }

      socket.on("message", (data) => {
        const { recipientID, content } = JSON.parse(data);

        if (Active_connections.has(recipientID)) {
          Active_connections.get(recipientID).send(
            JSON.stringify({
              sender: userID,
              content: content,
            })
          );
        }

        //update user presence status
        if (Active_connections.has(recipientID)) {
          if (Active_connections.get(recipientID).readyState === wss.OPEN) {
            updateDB(isOnline, true, userID);
          } else {
            updateDB(isOnline, false, userID);
          }
        }
      });

      socket.on("close", () => {
        Active_connections.delete(userID);

        //update user last seen as they disconnects
        updateDB(lastSeen, Date.now, userID);

        logger.info(`Client with userID ${userID} disconnected`);
      });
    } catch (err) {
      socket.terminate();
      logger.error(err.message);
    }
  });
};
