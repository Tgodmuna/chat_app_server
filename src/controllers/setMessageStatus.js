const MESSAGE = require("../models/message_model");
async function SetMessageStatus(messageID, user_id, conversationID) {
  return await MESSAGE.findByIdAndUpdate(
    { _id: messageID, conversationID, receiver: user_id, read: false },
    { $set: { read: true } },
    { new: true }
  );
}

module.exports = SetMessageStatus;
