const logger = require("../../logger");
module.exports = function tryCatch_md(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
      next();
    } catch (err) {
      res.status(500).send(err.message);
      logger.error(err);
      next(err);
    }
  };
};
