const app = require("./src/app");
const logger = require("./logger");
const http = require("http");
const WebSocket = require("ws");
const { WebSocketServer } = require("./src/util/webSocket");

// HTTP & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
});

WebSocketServer(wss);

const PORT = process.env.port || 5000;

server.listen(PORT, () => logger.info(`server started at port ${PORT}`));
