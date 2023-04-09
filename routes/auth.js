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

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Username or password incorrect" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.cookie("session", req.session.passport.user, {
        maxAge: 3600000,
        httpOnly: true,
      });
      console.log(req.session.passport.user);
      return res.status(200).json({ message: "Login success" });
    });
  })(req, res, next);
});

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

/* ************************ Swagger ************************ */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a single user.
 *     tags: [Authentication]
 *     description: Adds user credentials to the users collection in database.
 *     parameters:
 *      - name: firstName
 *        in: body
 *        description: The first name of the user
 *        required: true
 *        schema:
 *           type: string
 *           min: 4
 *           max: 40
 *      - name: lastName
 *        in: body
 *        description: The last name of the user
 *        required: true
 *        schema:
 *           type: string
 *           min: 4
 *           max: 40
 *      - name: emailAddr
 *        in: body
 *        description: The email address of the user
 *        required: true
 *        schema:
 *           unique: true
 *           type: string
 *      - name: password
 *        in: body
 *        description: The password for the account
 *        required: true
 *        schema:
 *           type: string
 *           min: 8
 *      - name: position
 *        in: body
 *        description: The position of the user. Default is member but can be set to admin as well
 *        required: false
 *        schema:
 *           type: string
 *           default: default value is member
 *      - name: address
 *        in: body
 *        description: The address of the user
 *        required: false
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User successfully created.
 *       400:
 *         description: Failed validation schema. Missing credintials.
 *       500:
 *         description: Internal server error.
 *
 */

/**
 * @swagger
 * /login:
 *    post:
 *      summary: Allows user to obtain access to restricted resources
 *      tags: [Authentication]
 *      description: Server checks user credentials. If user exists in database and
 *                   entered password matches with the database password, a cookie is
 *                   given to the user that can be used with future requests.
 *      parameters:
 *      - name: username
 *        in: x-www-form-urlencoded
 *        description: The email address of the user is the username
 *        required: true
 *        schema:
 *           unique: true
 *           type: string
 *      - name: password
 *        in: x-www-form-urlencoded
 *        description: The password for the account
 *        required: true
 *        schema:
 *           type: string
 *           min: 8
 *      responses:
 *       200:
 *         description: Login success.
 */

/**
 * @swagger
 * /logout:
 *    get:
 *      summary: User logs out of session
 *      tags: [Authentication]
 *      description: User logs out of session and cookie is discarded
 *      responses:
 *        200:
 *          description: Successfully logged out
 */

module.exports = router;
