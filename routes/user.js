const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAdmin } = require("../middleware/isAdmin");



router.route("/").get( isLoggedIn, isAdmin, async function (req, res) {
    try {
        const users = await User.find({}, { salt: 0, password: 0 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({
            message: "[Error - issue accessing route '/user']",
            error: err.message,
        });
    }
});

router.route("/:id").get(isLoggedIn, async function (req, res) {
        try {
            const user = await User.findById(req.params.id).select("-salt -password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({
                message: "Internal Server Error",
                error: err.message,
            });
        }
    })

module.exports = router;

