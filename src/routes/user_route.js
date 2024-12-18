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

module.exports = router;
