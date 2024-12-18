const USER = require("../models/user_model");

async function profileUpdate_cont(id, body) {
  const { name, bio, profilePicture, location, interests, status } = body;

  //find user by its id and update the requested field
  return await USER.findByIdAndUpdate(
    { id },
    {
      $set: {
        name: !name ? null : name,
        bio: !bio ? null : bio,
        profilePicture: !profilePicture ? null : profilePicture,
        location: !location ? null : location,
        interests: !interests ? null : interests,
        status: !status ? null : status,
      },
    },
    { new: true }
  );
}

module.exports = profileUpdate_cont;
