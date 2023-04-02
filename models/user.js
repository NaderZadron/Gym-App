const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  password: {
    min: 8,
    type: String,
    required: true,
  },
  salt: {
    type: String,
  },
  firstName: {
    min: 4,
    max: 40,
    type: String,
    required: true,
  },
  lastName: {
    min: 4,
    max: 40,
    type: String,
    required: true,
  },
  address: String,
  emailAddr: {
    type: String,
    required: true,
    unique: true,
  },
  position: {
    type: String,
    default: "member",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
  },
  // One to many relationship
  attending: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
});

userSchema.plugin(passportLocalMongoose, { usernameField: "emailAddr" });
module.exports = mongoose.model("User", userSchema);
