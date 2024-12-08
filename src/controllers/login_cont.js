const USER = require("../models/user_model");
const bcrypt = require("bcrypt");
module.exports = async function login(body) {
  const { email, password } = body;

  //check if user exist
  const user = await USER.findOne({ email });

  if (!user) return null;

  //check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;
};
