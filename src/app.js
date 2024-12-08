require("dotenv").config();
const express = require("express");
require("./config/db")();
const websocket = require("ws");
const { createServer } = require("http");

const Error_mw = require("./middleware/error_mw");
const verifyToken_mw = require("./middleware/verifyToken_mw");
const authorisation_mw = require("./middleware/authorisation_mw");

if (!process.env.jwtsecret) {
  throw new Error("FATAL ERROR: jwtsecret is not defined.");
}

const app = express();

app.use(Error_mw);
app.use(express.json());
app.use("/api/auth", require("./routes/auth_route"));
app.use("/api/users", verifyToken_mw, authorisation_mw, require("./routes/user_route"));
app.use("");

const server = createServer(app);
const wss = new websocket.Server({ server });

wss.on("connection", () => {});

module.exports = app;
