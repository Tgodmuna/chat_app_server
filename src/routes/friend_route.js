const tryCatch_mw = require("../middleware/tryCatch_mw");

const router = require("express").Router();
const FRIENDSHIP = require("../models/friendShip_model");
const USER = require("../models/user_model");
const { sendInvitation } = require("../services/mailer");
const { eventEmitter } = require("../util/webSocket");

//list all users to add as friends
router.get(
  "/users",
  tryCatch_mw(async (req, res) => {
    const users = await USER.find().select("-password");

    res.status(200).json(users);
    return;
  })
);

//request route
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

    //check for already existing request in the recipient friendshipRequestList.
    const user = await USER.findOne({ _id: recipientID }).select({
      friendRequestList: 1,
    });

    if (existingRelationship && user?.friendRequestList.includes(requesterID)) {
      return res.status(400).send("friendship request already exists");
    }

    //if no existing relationship, preceed with creation of relationship
    const new_request = new FRIENDSHIP({
      recipient: recipientID,
      requester: requesterID,
      status: "pending",
    });
    await new_request.save();

    //add the requester to the recipient request list
    user?.friendRequestList.push(requesterID);
    await user?.save();

    eventEmitter.emit("friendRequestSent", recipientID);
    return res.status(200).send("request sent successfully");
  })
);

//get all user friend request
router.get(
  "/friend-requests",
  tryCatch_mw(async (req, res) => {
    //extract user id from the request object injected by middlewares(verify token,authorisation)

    const user = await USER.findById(req.user._id);
    if (!user) return res.status(404).send("not a valid user");

    if (user.friendRequestList.length !== 0) {
      let AllRequest = await user.populate({
        path: "friendRequestList",
        select: "-password -friendRequestList -updatedAt -createdAt -role",
      });
      return res.status(200).json([AllRequest]);
    } else {
      return res.status(200).json({ message: "list is empty", list: user.friendRequestList });
    }
  })
);

//accept route
router.put(
  "/accept",
  tryCatch_mw(async (req, res) => {
    const { requesterID } = req.body;
    const recipientID = req.user._id;

    //check for already existing friendship.
    const friendship = await FRIENDSHIP.findOne({
      $or: [
        { requester: requesterID, recipient: recipientID, status: "pending" },
        { requester: recipientID, recipient: requesterID, status: "pending" },
      ],
    });

    if (!friendship) return res.status(404).send("no such friendship");

    friendship.status = "accepted";
    await friendship.save();

    //since the friendship has changed from pending to accepted,
    //remove the requester from the recipient list
    await USER.findOneAndUpdate(
      { _id: recipientID },
      { $pull: { friendRequestList: requesterID } }
    );

    //update the both requester and recipient friend list.
    await USER.findOneAndUpdate({ _id: recipientID }, { $push: { friends: requesterID } });
    await USER.findOneAndUpdate({ _id: requesterID }, { $push: { friends: recipientID } });

    eventEmitter.emit("friendRequestAccepted", recipientID);

    // After accepting friendship
    return res.status(200).send("friendship accepted");
  })
);

//reject route
router.put(
  "/rejected",
  tryCatch_mw(async (req, res) => {
    const { requesterID } = req.body;
    const recipientID = req.user._id;

    //modify the relationship.
    const friendship = await FRIENDSHIP.findOne({
      $or: [
        { requester: requesterID, recipient: recipientID, status: "pending" },
        { requester: recipientID, recipient: requesterID, status: "pending" },
      ],
    });

    //modify the user friend request list.
    await USER.findOneAndUpdate(
      { _id: recipientID },
      { $pull: { friendRequestList: requesterID } }
    );
    //notify the requester that their request was rejected.
    eventEmitter.emit("friendRequestRejected", requesterID);

    return res.status(200).send("friendship request rejected");
  })
);

//block route
router.put(
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

//send-invitation route
router.post(
  "/send-invitation",
  tryCatch_mw(async (req, res) => {
    const { email, inviteeName } = req.body;

    //send the mail to the recipient
    sendInvitation(email, inviteeName);

    if (!sendInvitation) return res.status(500).send("error sending invitation");

    return res.status(200).send("invitation sent successfully");
  })
);

module.exports = router;
