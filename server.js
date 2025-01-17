const app = require("./src/app");
const logger = require("./logger");
const http = require("http");
const WebSocket = require("ws");
const { WebSocketServer } = require("./src/util/webSocket");
const CORS = require("cors");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  app(req, res);
});

const wss = new WebSocket.Server({
  server,
});

WebSocketServer(wss);

const PORT = process.env.port || 5000;

server.listen(PORT, () => logger.info(`server started at port ${PORT}`));
