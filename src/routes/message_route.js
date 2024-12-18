const { eventEmitter } = require("../util/webSocket");
const retrieveSpecificConvMsg = require("../controllers/getMessages_cont");
const tryCatch_mw = require("../middleware/tryCatch_mw");
const SetMessageStatus = require("../controllers/setMessageStatus");
const deleteMessage = require("../controllers/deleteMessage_cont");
const MESSAGE = require("../models/message_model");
const CONVERSATION = require("../models/conversation model_model");

const router = require("express").Router();

//get message for a conversation
router.get(
  "/Message/:conversationID",
  tryCatch_mw(async (req, res) => {
    const conversationID = req.params.conversationID;
    const { limit, page } = req.query;
    const userID = req.user_id;

    const messages = await retrieveSpecificConvMsg(conversationID, page, limit);

    return res.status(200).json([messages]);
  })
);

//set a message as read
router
  .patch(
    "/mark-read/:messageID/:conversationID",
    tryCatch_mw(async (req, res) => {
      const userID = req.user._id;
      const { messageID, conversationID } = req.params;

      if (!messageID && !conversationID)
        return res.status(400).json({ message: " require messageID & conversationID" });

      await SetMessageStatus(messageID, userID, conversationID);

      //notify the user about the message status
      eventEmitter.emit("messageRead", userID);
      res.status(200).send("success");
      return;
    })
  ) //set all message as read
  .patch(
    "/mark-read/all/:conversationID",
    tryCatch_mw(async (req, res) => {
      const { conversationID } = req.params;

      MESSAGE.updateMany(
        { conversationID, receiver: req.user._id, read: false },
        { $set: { read: true } }
      );

      eventEmitter.emit("messageRead", req.user._id);

      return res.status(200).send("success");
    })
  );

//delete message
router.delete(
  "/delete-message/:messageID",
  tryCatch_mw(async (req, res) => {
    const { messageID } = req.params;
    const userID = req.user._id;
    const conversationID = req.query.conversationID;

    if (!messageID) return res.status(400).json({ message: "messageID is required" });

    await deleteMessage(messageID);

    //also delete from conversation
    await CONVERSATION.findOneAndDelete({ participants: { $in: { userID } }, _id: conversationID });

    return res.status(200).json({ message: "message deleted successfully" });
  })
);

module.exports = router;
