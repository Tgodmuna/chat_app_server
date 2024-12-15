const logger = require("../../logger");
function Error_mw(err, req, res, next) {
  logger.error(err);

  res.status(500).send(err.message);
}

module.exports = Error_mw;
