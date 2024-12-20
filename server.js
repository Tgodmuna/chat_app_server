const app = require("./src/app");
const logger = require("./logger");

const PORT = process.env.port || 5000;

app.listen(PORT, () => logger.info(`server started at port ${PORT}`));
