const MESSAGE = require("../models/message_model");
async function getUnreadMessages(userID) {
  return await MESSAGE.find({ read: false });
}
