const tryCatch_mw = require("../middleware/tryCatch_mw");

const router = require("express").Router();
const FRIENDSHIP = require("../models/friendShip_model");
const USER = require("../models/user_model");

router.post(
  "/request",
  tryCatch_mw(async (req, res) => {
    const { requesterID, recipientID } = req.body;

    //check for already existing request.
    const existingRelationship = await FRIENDSHIP.findOne({
      $or: [
        { requester: requesterID, recipient: recipientID },
        { requester: recipientID, recipient: requesterID },
      ],
    });

    if (existingRelationship) {
      res.status(400).send("friendship request already exists");
    }

    //if no existing relationship, preceed with creation of relationship
    const new_request = new FRIENDSHIP({
      recipient: recipientID,
      requester: requesterID,
      status: "pending",
    });

    await new_request.save();

    return res.status(200).send("request sent succesfully");
  })
);

router.post(
  "/accept",
  tryCatch_mw(async (req, res) => {
    const { requesterID } = req.body;
    const recipientID = req.user._id;

    const friendship = await FRIENDSHIP.findOne({
      $or: [
        { requester: requesterID, recipient: recipientID, status: "pending" },
        { requester: recipientID, recipient: requesterID, status: "pending" },
      ],
    });

    if (!friendship) return res.status(404).send("no such friendship");

    friendship.status = "accepted";

    //update the both requester and recipient friend list.
    await USER.findOneAndUpdate({ _id: recipientID }, { friends: { $push: requesterID } });

    await USER.findOneAndUpdate({ _id: requesterID }, { friends: { $push: { recipientID } } });

    return res.status(200).send("friendship accepted");
  })
);

router.post(
  "block-user",
  tryCatch_mw(async (req, res) => {
    const { userID_to_block } = req.body;
    const userID = req.user_id;

    //modify their relationship.
    const friendship = await FRIENDSHIP.findOne({
      $or: [
        { requester: userID, recipient: userID, status: "accepted" },
        { requester: userID_to_block, recipient: userID, status: "accepted" },
      ],
    });

    if (!friendship) return res.status(404).send("no such relationship");

    friendship.status = "blocked";

    friendship.save();

    //remove each other from their friendlist
    await USER.findOneAndUpdate({ _id: userID }, { friends: { $pull: userID_to_block } });

    await USER.findOneAndUpdate({ _id: userID_to_block }, { friends: { $pull: { userID } } });

    return res.status(200).send("blocked user successful");
  })
);
