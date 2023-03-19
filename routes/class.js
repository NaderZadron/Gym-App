const express = require("express");
const router = express.Router();
const Class = require("../models/class");
const classSchemaValidator = require("../models/classSchemaValidator");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAdmin } = require("../middleware/isAdmin");

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const allData = await Class.find({});
      if (!allData) {
        return res.status(204).json({
          message: "No Content",
        });
      }
      res.status(200).json({
        message: "Get all classes available",
        data: allData,
        status: res.statusCode,
        query: res.query,
      });
    } catch (error) {
      next(error);
    }
  })
  .post(isLoggedIn, isAdmin(), async (req, res, next) => {
    try {
      const { error, value } = classSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: "Invalid request body",
          error: error.details[0].message,
        });
      }

      const savedClass = new Class(value);
      await savedClass.save();

      res.status(201).json({
        message: "Class successfully added",
        class: savedClass,
      });
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const data = await Class.findById(req.params.id);
      if (!data) {
        return res.status(404).json({
          message: "Class Not Found",
        });
      }
      res.status(200).json({
        message: `Get class with id: ${req.params.id}`,
        data: data,
        status: res.statusCode,
        query: res.query,
      });
    } catch (err) {
      next(err);
    }
  })
  .put(isLoggedIn, isAdmin(), async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const { error, value } = classSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: "Invalid request body",
          error: error.details[0].message,
        });
      }
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      return res
        .status(200)
        .json({ message: "Class updated successfully", data: updatedClass });
    } catch (err) {
      next(err);
    }
  })
  .delete(isLoggedIn, isAdmin(), async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const data = await Class.findByIdAndDelete(req.params.id);
      if (!data) {
        return res.status(404).json({
          message: "Does Not Exist",
        });
      }
      res.status(200).json({
        message: `The class with id ${req.params.id} has been deleted`,
        data,
      });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
