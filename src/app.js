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
const webSocket = require("./util/webSocket");

if (!process.env.jwtsecret) {
  throw new Error("FATAL ERROR: jwtsecret is not defined.");
}

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth_route"));
app.use("/api/users", verifyToken_mw, authorisation_mw, require("./routes/user_route"));
app.use(Error_mw);
const app = express();

// HTTP & WebSocket Server
const server = createServer(app);
const wss = new WebSocket.Server({ server });

webSocket(wss);

module.exports = app;
