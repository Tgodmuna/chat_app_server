const USER = require("../models/user_model");
const bcrypt = require("bcrypt");

const register = async (body) => {
  if (!body) return null;

  let { email, password, name, phone, location, gender, age, status, role } = body;

  // check if user already registered

  let user = await USER.findOne({ $or: [{ email }, { phone }] });

  if (user) return "exisiting_user";

  //if not, proceed with the registration.
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user = await new USER({ name, email, phone, password, age, location, gender, status, role });

  return user.save();
};

module.exports = register;
