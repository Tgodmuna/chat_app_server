const USER = require("../models/user_model");

async function profileUpdate_cont(id, body) {
  try {
    if ((!body && id) || !id || !body) {
      throw new Error("update value and id is required");
    }

    const { name, bio, profilePicture, location, interests, status } = body;

    //find user by its id and update the requested field
    const updated = await USER.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name && name,
          bio: bio && bio,
          profilePicture: profilePicture && profilePicture,
          location: location && location,
          interests: interests && interests,
          status: status && status,
        },
      },
      { new: true }
    );

    return updated;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

module.exports = profileUpdate_cont;
