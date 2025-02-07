// @ts-nocheck
const router = require("express").Router();
const tryCatch_mw = require("../middleware/tryCatch_mw");
const authorised = require("../middleware/authorisation_mw");
const getUser_mw = require("../middleware/getUser_mw");
const profileUpdate_cont = require("../controllers/profileUpdate_cont");
const verifyToken_mw = require("../middleware/verifyToken_mw");
const USER = require("../models/user_model");
const _ = require("lodash");
const multer = require("multer");
const uploadMW = require("../middleware/upload_mw");
const path = require("path");
const logger = require("../../logger");
const jwt = require("jsonwebtoken");
const FIRENDSHIP = require("../models/friendShip_model");

//get the user profile by id
router
  .get("/details/:id", [
    getUser_mw,
    tryCatch_mw((req, res) => {
      const user = req.user;

      return res.status(200).json({ user });
    }),
  ]) // update user info

  .put("/update/:id", [
    tryCatch_mw(async (req, res) => {
      const id = req.params.id;
      console.log("idParam", id);
      console.log("body:", req.body);

      if (!id) return res.status(400).json("no id provided");
      if (!req.body.data) return res.status(400).json("no payload specified");

      const updated = await profileUpdate_cont(id, req.body.data);

      if (!updated) return res.status(400).json("error coccured cannot proceed");

      //return the updated profile
      return res.status(200).json({ updated });
    }),
  ]);

//upload profile picture
router.post(
  "profile/upload",
  uploadMW,
  tryCatch_mw(async (err, req, res) => {
    logger.info("file uploaded successfully");
    const filePath = path.join(__dirname, "../../public/profile_pic/", req.file.filename);

    //update the user profileImage path with the file path
    const user = USER.findByIdAndUpdate(
      req.user_id,
      { $set: { profilePicture: filePath } },
      { new: true }
    );

    res.status(200).json({ message: " uploaded successfully", user });
  })
);

//get user profile picture
//take a query like this: ?file=filename
router.get("/profile/pic", (req, res) => {
  console.log(__dirname);
  const filename = req.query.file;

  const filepath = path.join(__dirname, "../../public/profile_pic/", filename);

  console.log(filepath);

  if (!filename) return res.status(400).json("invalid file filename");

  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).json("file not found");
      logger.error("could not json file to user", err);
      return;
    }
    // res.status(200).json("file json successfully");
    logger.info("file sent to the user");
    return;
  });
});

//get user friendlist
router.get(
  "/friends_list",
  tryCatch_mw(async (req, res) => {
    const user = await USER.findOne({ _id: req.user._id });

    //check if the friendlist is not empty
    if (user.friends.length === 0)
      return res.status(200).json({ message: "empty friendlist", data: [] });

    const populatedUser = await user.populate("friends", "-password");
    const { friends } = populatedUser;

    return res.status(200).json({ message: "retrieved successfully", data: friends });
  })
);

//remove a friend from the list
router
  .patch(
    `/friend_list/unfriend/:friend_id`,
    tryCatch_mw(async (req, res) => {
      const friend_id = req.params.friend_id;

      if (!friend_id) return res.status(404).json("no friend id provided");

      const User = await USER.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { friends: friend_id } },
        { new: true }
      ).populate("friends");

      if (!User) {
        return res.status(404).json({ message: "friend not found, could not unfriend" });
      }

      //update the friendship collection immediately to tally with the current change made.
      const friendShip = await FIRENDSHIP.findOne({
        $or: [
          { recipient: friend_id, requester: req.user_id, status: "accepted" },
          { requester: friend_id, recipient: req.user_id, status: "accepted" },
        ],
      });

      if (!friendShip) return res.status(404).json("no such friendship found");

      friendShip.status = "unfriend";

      await friendShip.save();

      return res.status(200).json({
        message: "Friend removed successfully",
        data: User.friends,
      });
    })
  )
  .get(
    "/friend_requests",
    tryCatch_mw(async (req, res) => {
      const requests = await USER.findOne({ _id: req.user._id })
        .select("friendRequestList")
        .populate("friendRequestList");

      if (!requests)
        return res.status(404).send("invalid user hence, could not retrieve friend request");

      return res.status(200).json({ requests });
    })
  );

module.exports = router;
