const mongoose = require("mongoose");
const FRIENDSHIP = require("./friendShip_model");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  age: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "single",
      "married",
      "divorced",
      "widowed",
      "separated",
      "in a relationship",
      "engaged",
      "single parent",
    ],
    default: "single", // Default status
  },
  profilePicture: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  interests: [
    {
      type: String,
    },
  ],
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  friendRequestList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: 1 });
userSchema.index({ friends: 1 });
userSchema.index({ friendRequestList: 1 });

module.exports = mongoose.model("User", userSchema);
