const MESSAGE = require("../models/message_model");
async function SetMessageStatus(messageID, status) {
  return await MESSAGE.findByIdAndUpdate({ _id: messageID }, { read: status }, { new: true });
}

module.exports = SetMessageStatus;
