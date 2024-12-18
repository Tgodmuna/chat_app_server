const router = require("express").Router();
const tryCatch_mw = require("../middleware/tryCatch_mw");
const authorised = require("../middleware/authorisation_mw");
const getUser_mw = require("../middleware/getUser_mw");
const profileUpdate_cont = require("../controllers/profileUpdate_cont");
const verifyToken_mw = require("../middleware/verifyToken_mw");

//get the user profile by id
router
  .get("/:id", [
    getUser_mw,
    tryCatch_mw((req, res) => {
      const user = req.user;

      return res.status(200).json({ user });
    }),
  ]) // update user info

  .put("/update/:id", [
    tryCatch_mw(async (req, res) => {
      const id = req.params.id;

      const updated = await profileUpdate_cont(id, req.body);

      if (!updated) return res.status(400).send("user not found, cant update");

      //return the updated profile
      return res.status(200).json({ updated });
    }),
  ]);

router
  .get(
    "/friends-list",
    tryCatch_mw(async (req, res) => {
      const user = await USER.findOne({ _id: req.user._id });

      //get all the user's friendlist
      let friends = _.pick(user?.populate("friends"), [
        "name,phone,location,gender,status,profilePicture,bio,interest",
        "isOnline",
        "lastSeen",
      ]);

      return res.status(200).json({ message: "retreived successfully", data: friends });
    })
  )
  .patch(
    "friend-list/remove/:friend_id",
    tryCatch_mw(async (req, res) => {
      const friend_id = req.params.friend_id;

      const User = await USER.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { friends: friend_id } },
        { new: true }
      ).populate("friends");

      if (!User) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Friend removed successfully",
        data: User.friends,
      });
    })
  );

module.exports = router;
