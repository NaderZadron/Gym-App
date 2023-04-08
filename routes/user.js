const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {isLoggedIn} = require("../middleware/isLoggedIn");
const {isAdmin} = require("../middleware/isAdmin");
const crypto = require("crypto");


router.route("/").get(isLoggedIn, isAdmin(), async function (req, res) {
    try {
        const users = await User.find({}, {salt: 0, password: 0});
        if (!users) {
            return res.status(204).json({message: "List of users not found"});
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


router.route("/:id")
    .get(isLoggedIn, async function (req, res) {
        try {
            const user = await User.findById(req.session.passport.user.id).select("-salt -password");
            if (!user) {
                return res.status(204).json({message: "Unable to find user profile"});
            }
            res.status(200).json(user);
            console.log("[Sent user to profile page]")
        } catch (err) {
            res.status(500).json({
                message: "[ERROR - issue encountered while calling profile route]",
                error: err.message,
            });
        }
    })

    // this call does not properly hide the password upon update
    .put(isLoggedIn, async function (req, res) {
        try {
            const user = await User.findById(req.session.passport.user.id);
            if (!user) {
                return res.status(204).json({ message: "Unable to find user profile to update" });
            }

            // update user object with data from request body
            Object.assign(user, req.body);

            // hash password if present in req.body
            if (req.body.hasOwnProperty("password")) {
                const salt = crypto.randomBytes(16).toString("hex");
                const hashedPassword = await new Promise((resolve, reject) => {
                    crypto.pbkdf2(
                        req.body.password,
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
                user.salt = salt;
                user.password = hashedPassword;
            }

            // save updated user object to MongoDB
            await user.save();

            res.status(200).json({ message: "User information successfully updated", user });
            console.log(`[User has been updated]`);
        } catch (err) {
            res.status(500).json({
                message: "[ERROR - issue encountered while updating user]",
                error: err.message,
            });
        }
    })
    .delete(isLoggedIn, isAdmin(), async function (req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(204).json({ message: "Cannot find user to delete" });
            }
            res.status(200).json({ message: "User has been successfully deleted" });
            console.log(`[User has been deleted]`);
        } catch (err) {
            res.status(500).json({
                message: "[ERROR - issue encountered while calling delete route]",
                error: err.message,
            });
        }
    });

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
