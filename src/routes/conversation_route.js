const CONVERSATION = require("../models/conversation_model");
const MESSAGE = require("../models/message_model");
const retrieveUSerConversations = require("../controllers/getUserConversations_cont");

const tryCatch_mw = require("../middleware/tryCatch_mw");
const logger = require("../../logger");

const router = require("express").Router();

//route for getting all conversations user involved in
router.get(
  "/conversations",
  tryCatch_mw(async (req, res) => {
    const userID = req.user._id;

    const conversation = await retrieveUSerConversations(userID);

    return res.status(200).json([conversation]);
  })
);

//delete a conversation
router.delete(
  "/delete-conversation/:conversationID",
  tryCatch_mw(async (req, res) => {
    const { conversationID } = req.params;

    if (!conversationID) {
      logger.error("conversationID not provided");
      return;
    }

    await CONVERSATION.findByIdAndDelete(conversationID);
    await MESSAGE.deleteMany({
      conversationID,
    });

    logger.info("conversation deleted");

    return res.status(200).send("conversation deleted successful");
  })
);

module.exports = router;
