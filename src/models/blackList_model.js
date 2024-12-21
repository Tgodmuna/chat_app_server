const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blackListSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "14d",
  },
});

module.exports = mongoose.model("BlackList", blackListSchema);
