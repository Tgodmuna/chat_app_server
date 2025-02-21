const CONVERSATION = require("../models/conversation_model");
const MESSAGE = require("../models/message_model");
const retrieveUserConversations = require("../controllers/getUserConversations_cont");

const tryCatch_mw = require("../middleware/tryCatch_mw");
const logger = require("../../logger");

const router = require("express").Router();

// Route for getting all conversations user is involved in
router.get(
  "/conversations",
  tryCatch_mw(async (req, res) => {
    const userID = req.user._id;

    const conversationList = await retrieveUserConversations(userID);

    return res.status(200).json(conversationList);
  })
);

// Route for getting a specific conversation with populated participants
router.get(
  "/conversation/:conversationID",
  tryCatch_mw(async (req, res) => {
    const { conversationID } = req.params;

    if (!conversationID) {
      logger.error("conversationID not provided");
      return res.status(400).send("conversationID not provided");
    }

    const conversation = await CONVERSATION.findById(conversationID).populate("participants");

    if (!conversation) {
      logger.error("Conversation not found");
      return res.status(404).send("Conversation not found");
    }
    console.log("conversation:", conversation);

    return res.status(200).json(conversation);
  })
);

// Delete a conversation
router.delete(
  "/delete-conversation/:conversationID",
  tryCatch_mw(async (req, res) => {
    const { conversationID } = req.params;

    if (!conversationID) {
      logger.error("conversationID not provided");
      return res.status(400).send("conversationID not provided");
    }

    await CONVERSATION.findByIdAndDelete(conversationID);
    await MESSAGE.deleteMany({ conversationID });

    logger.info("Conversation deleted");

    return res.status(200).send("Conversation deleted successfully");
  })
);

module.exports = router;
