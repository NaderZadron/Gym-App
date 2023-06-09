const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Class = require("../models/class");
const Attendance = require("../models/attendance");
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAdmin } = require("../middleware/isAdmin");
const crypto = require("crypto");
const authJwtController = require("../middleware/auth_jwt");
const jwt = require("jsonwebtoken");

router
  .route("/")
  .get(authJwtController.isAuthenticated, isAdmin(), async function (req, res) {
    try {
      const users = await User.find({}, { salt: 0, password: 0 });
      if (!users) {
        return res.status(204).json({ message: "List of users not found" });
      }
      res.status(200).json(users);
      console.log("[Returned list of users]");
    } catch (err) {
      res.status(500).json({
        message: "[ERROR - issue encountered while getting all users]",
        error: err.message,
      });
    }
  });

router
  .route("/:id")
  .get(authJwtController.isAuthenticated, async function (req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1]; // get the token from the authorization header
      const decoded = jwt.verify(token, process.env.SECRET_KEY); // verify the token
      const userId = decoded.id; // get the user ID from the token
      const user = await User.findById(userId).select("-salt -password");
      if (!user) {
        return res.status(204).json({ message: "Unable to find user profile" });
      }
      res.status(200).json(user);
      console.log("[Sent user to profile page]");
    } catch (err) {
      res.status(500).json({
        message: "[ERROR - issue encountered while calling profile route]",
        error: err.message,
      });
    }
  })

  // this call does not properly hide the password upon update
  .put(authJwtController.isAuthenticated, async function (req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1]; // get the token from the authorization header
      const decoded = jwt.verify(token, process.env.SECRET_KEY); // verify the token
      const userId = decoded.id; // get the user ID from the token
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(204)
          .json({ message: "Unable to find user profile to update" });
      }

      // update user object with data from request body
      Object.assign(user, req.body);

      // save updated user object to MongoDB
      await user.save();

      res
        .status(200)
        .json({ message: "User information successfully updated", user });
      console.log(`[User has been updated]`);
    } catch (err) {
      res.status(500).json({
        message: "[ERROR - issue encountered while updating user]",
        error: err.message,
      });
    }
  })
  .delete(
    authJwtController.isAuthenticated,
    isAdmin(),
    async function (req, res) {
      try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
          return res
            .status(204)
            .json({ message: "Cannot find user to delete" });
        }
        res.status(200).json({ message: "User has been successfully deleted" });
        console.log(`[User has been deleted]`);
      } catch (err) {
        res.status(500).json({
          message: "[ERROR - issue encountered while calling delete route]",
          error: err.message,
        });
      }
    }
  );

router.get(
  "/:id/classes",
  authJwtController.isAuthenticated,
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const attendanceRecords = await Attendance.find({ user: userId }).exec();
      if (!attendanceRecords) {
        return res.status(404).json({
          message: "No attendance information found",
        });
      }
      // Extract the class IDs from the attendance records
      const classIds = attendanceRecords.map((record) => record.class);
      const classes = await Class.find({ _id: { $in: classIds } }).exec();
      if (!classes) {
        return res.status(404).json({
          message: "Class not found",
        });
      }
      res.status(200).json({
        data: classes,
      });
    } catch (error) {
      res.status(500).json({
        message: "[ERROR - issue encountered while getting classes]",
        error: error.message,
      });
    }
  }
);

module.exports = router;

/* ************************ Swagger ************************ */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: user endpoints
 */

/**
 * @swagger
 * securitySchemes:
 *  cookieAuth:
 *    type: apiKey
 *    in: cookie
 *    name: <name_of_your_cookie>
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users.
 *     tags: [User]
 *     description: Returns a JSON object that contains a list of all users stored in the database, but only if the request comes from an admin.
 *     responses:
 *       200:
 *         description: Returned a list of all users.
 *       204:
 *         description: Unable to find any users in the database.
 *       500:
 *         description: Issue sending get request for all user entities.
 *
 */

/**
 * @swagger
 * /user/userID:
 *   get:
 *     summary: Access personal profile.
 *     tags: [User]
 *     description: Based off the stored passport session id for a client, redirect them to their personal profile
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: userID
 *        in: path
 *        description: The passport session ID for each user
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: successfully accessed user profile
 *       204:
 *         description: Unable to find specified user profile.
 *       400:
 *         description: Issue encountered sending get/:id route.
 *
 */

/**
 * @swagger
 * /user/userID:
 *   put:
 *     summary: Update personal profile details.
 *     tags: [User]
 *     description: Based off the stored passport session id for a client, redirect them to their personal profile
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: userID
 *        in: path
 *        description: The passport session ID for each user
 *        required: true
 *        schema:
 *          type: string
 *      - name: firstName
 *        in: body
 *        description: String to update user's first name with
 *        schema:
 *           type: string
 *      - name: lastName
 *        in: body
 *        description: String to update user's last name with
 *        schema:
 *           type: string
 *      - name: emailAddr
 *        in: body
 *        description: String to update user's email address
 *        schema:
 *           type: string
 *      - name: position
 *        in: body
 *        description: String which details the auth level of a user
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile successfully updated
 *       204:
 *         description: Unable to find user profile to update
 *       400:
 *         description: Issue encountered while trying to update user (Might be missing a parameter in the sent body)
 *
 */

/**
 * @swagger
 * /user/userID:
 *   delete:
 *     summary: Delete profile determined by ID.
 *     tags: [User]
 *     description: If the stored passport session ID (cookie) for a user matches an admin account, delete a user from the database determined by the path variable (/:id)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: userID
 *        in: path
 *        description: The passport session ID for each user
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Successfully deleted user of specified ID.
 *       204:
 *         description: Unable to find user of specified ID.
 *       400:
 *         description: Issue encountered while attempting to delete user.
 *
 */

/**
 * @swagger
 * /user/:userId/classes:
 *   get:
 *     summary: Get all the classes the user is registered for.
 *     tags: [User]
 *     description: Returns a JSON object that contains a list of all classes the user is registered for.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: userID
 *        in: path
 *        description: The user id
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Returned a list of classes.
 *       404:
 *         description: Unable to find user, classes or attendance.
 *       500:
 *         description: Internal server error.
 *
 */
