const mongoose = require("mongoose");

const friendShip_schema = new mongoose.Schema({
  recipient: { type: mongoose.Types.ObjectId, ref: "User" },
  requester: { type: mongoose.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked"],
    default: "pending",
  },
  time: { type: Date, default: Date.now() },
});

friendShip_schema.index({ status: 1, recipientID: 1, requesterID: 1 });

module.exports = mongoose.model("Friendship", friendShip_schema);
