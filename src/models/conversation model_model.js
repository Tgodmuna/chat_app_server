const { required } = require("joi");
const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Conversations",
  new mongoose.Schema({
    type: ["direct", "group"],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
          validator: function (value) {
            return value.length >= 2 ? value : false;
          },
          message: "participants can not be less than two",
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now(),
    },
    upDatedAt: { default: new Date(), type: Date },

    isDeleted: { type: Boolean, default: false },
  })
);
