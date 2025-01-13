const logger = require("../../logger");
const USER = require("../models/user_model");
const bcrypt = require("bcrypt");

const register = async (body) => {
  if (!body) return null;

  let { email, password, name, phone, location, gender, age, status, role } = body;

  // Debug input
  logger.debug("Received body:", body);

  // Check if user already registered
  let existing_user = await USER.findOne({ $or: [{ email }, { phone }] });

  if (existing_user) {
    return "existing_user";
  }

  // If not, proceed with the registration.
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  let newUser = new USER({
    name,
    email,
    phone,
    password,
    age,
    location,
    gender,
    status,
    role: role && role,
  });

  await newUser.save();

  return newUser;
};

module.exports = register;
