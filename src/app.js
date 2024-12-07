const express = require("express");
require("dotenv").config();
require("./config/db")();
const websocket = require("ws");
const app = express();

const { createServer } = require("http");
const server = createServer(app);
const wss = new websocket.Server({ server });

module.exports = app;
