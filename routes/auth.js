var express = require("express");
var router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const User = require("../models/user");
const userSchemaValidator = require("../models/userSchemaValidator");

router.post("/register", async function (req, res) {
  try {
    const { error, value } = userSchemaValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { emailAddr, password, firstName, lastName, address, position } =
      value;

    // Generate a random salt value and use it to hash the user's password
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        (err, hashedPassword) => {
          if (err) {
            return reject(new Error("Error hashing password"));
          }
          resolve(hashedPassword.toString("hex"));
        }
      );
    });
    // Create a new user document in the database
    const user = new User({
      emailAddr,
      salt: salt.toString(),
      password: hashedPassword.toString("Hex"),
      firstName,
      lastName,
      address,
      position,
    });

    await user.save();

    res.status(200).json({
      message: "User successfully created",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

router.get("/login", function (req, res) {
  res.status(200).json({
    message: "Login page",
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.session.user_id = req.user.id;
    res.status(200).json("Login Success");
  }
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      message: "Successfully logged out",
    });
  });
});

module.exports = router;
