const mongoose = require("mongoose");
const logger = require("../../logger");
async function connectDB() {
  try {
    logger.info("connecting to database......");

    await mongoose.connect(`${process.env.DB_string}`);

    logger.info("Database connected successfully");
  } catch (err) {
    logger.error(err);
  }
}

module.exports = connectDB;
