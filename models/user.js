const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");

const UserSchema = new mongoose.Schema({
  password: {
    min: 8,
    type: String,
    required: true,
    select: false,
  },
  salt: {
    type: String,
    select: false,
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

UserSchema.pre("save", function (next) {
  var user = this;

  //hash the password
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, null, null, function (err, hash) {
    if (err) return next(err);

    //change the password
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (password, callback) {
  var user = this;

  bcrypt.compare(password, user.password, function (err, isMatch) {
    callback(isMatch);
  });
};

// userSchema.plugin(passportLocalMongoose, { usernameField: "emailAddr" });
module.exports = mongoose.model("User", UserSchema);
