// @ts-nocheck
require("dotenv").config();
const express = require("express");
require("./config/db")();
const WebSocket = require("ws");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const logger = require("../logger");

const Error_mw = require("./middleware/error_mw");
const verifyToken_mw = require("./middleware/verifyToken_mw");
const authorisation_mw = require("./middleware/authorisation_mw");
const { WebSocketServer } = require("./util/webSocket");
const app = express();

if (!process.env.jwtsecret) {
  throw new Error("FATAL ERROR: jwtsecret is not defined.");
}

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth_route"));
app.use("/api/users", verifyToken_mw, authorisation_mw, require("./routes/user_route"));
app.use("/api/friend", verifyToken_mw, authorisation_mw, require("./routes/friend_route"));
app.use("/api/messages", verifyToken_mw, authorisation_mw, require("../src/routes/message_route"));
app.use(
  "/api/conversations",
  verifyToken_mw,
  authorisation_mw,
  require( "../src/routes/conversation_route.js" )
  
);

app.use(Error_mw);

// HTTP & WebSocket Server
const server = createServer(app);
const wss = new WebSocket.Server({ server });

WebSocketServer(wss);

module.exports = app;
