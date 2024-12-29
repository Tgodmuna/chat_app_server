const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Conversations",
  new mongoose.Schema({
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId], 
      required: true,
      validate: [
        {
          validator: function (value) {
            return Array.isArray(value) && value.length >= 2;
          },
          message: "Participants must include at least two IDs.",
        },
        {
          validator: function (value) {
            return new Set(value.map(String)).size >= 2;
          },
          message: "Participants must contain at least two unique IDs.",
        },
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  })
);
