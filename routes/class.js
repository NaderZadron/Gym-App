const express = require("express");
const router = express.Router();
const Class = require("../models/class");
const classSchemaValidator = require("../models/classSchemaValidator");
const mongoose = require("mongoose");
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

/* ************************ Swagger ************************ */

/**
 * @swagger
 * tags:
 *   name: Class
 *   description: Class endpoints
 */

/**
 * @swagger
 * /class:
 *   get:
 *     summary: Get all classes.
 *     tags: [Class]
 *     description: Return a JSON object that has all of the classes in the database.
 *     responses:
 *       200:
 *         description: Get all classes available.
 *       204:
 *         description: Classes not found. Database has no classes.
 *
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
 * /class:
 *   post:
 *     summary: Add class to database.
 *     tags: [Class]
 *     description: Adds a single class to the class collection in the database. Position needs to equal admin for user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: dateOfClass
 *        in: body
 *        description: The date of the class
 *        required: true
 *        schema:
 *           type: string
 *           format: date
 *      - name: timeOfClass
 *        in: body
 *        description: The time of the class in military time
 *        required: true
 *        schema:
 *           type: string
 *           pattern: '([01][0-9]|2[0-3]):[0-5][0-9]'
 *      - name: trainerName
 *        in: body
 *        description: The name of the trainer
 *        required: true
 *        schema:
 *           type: string
 *      - name: capacity
 *        in: body
 *        description: The max size of the class
 *        required: true
 *        schema:
 *           type: integer
 *      - name: typeOfClass
 *        in: body
 *        description: The type of class. Boxing, MMA, etc.
 *        required: true
 *        schema:
 *           type: string
 *      - name: location
 *        in: body
 *        description: The location of the class. Gym address
 *        required: true
 *        schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Class successfully added.
 *       400:
 *         description: Invalid Request Body. Missing a parameter in the body.
 *
 */

/**
 * @swagger
 * /class/classID:
 *   get:
 *     summary: Get a single class.
 *     tags: [Class]
 *     description: Return a JSON object that has all information of a single class from the database.
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the class
 *        required: true
 *        schema:
 *           type: ObjectID
 *     responses:
 *       200:
 *         description: Get single class with id.
 *       204:
 *         description: Classes not found. Database has no classes.
 *       404:
 *         description: Class Not Found.
 *
 */

/**
 * @swagger
 * /class/classID:
 *   put:
 *     summary: Update a single class.
 *     tags: [Class]
 *     description: Updates a single class from the database with new information. Position needs to be admin for user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *      - name: dateOfClass
 *        in: body
 *        description: The date of the class
 *        required: true
 *        schema:
 *           type: string
 *           format: date
 *      - name: timeOfClass
 *        in: body
 *        description: The time of the class in military time
 *        required: true
 *        schema:
 *           type: string
 *           pattern: '([01][0-9]|2[0-3]):[0-5][0-9]'
 *      - name: trainerName
 *        in: body
 *        description: The name of the trainer
 *        required: true
 *        schema:
 *           type: string
 *      - name: capacity
 *        in: body
 *        description: The max size of the class
 *        required: true
 *        schema:
 *           type: integer
 *      - name: typeOfClass
 *        in: body
 *        description: The type of class. Boxing, MMA, etc.
 *        required: true
 *        schema:
 *           type: string
 *      - name: location
 *        in: body
 *        description: The location of the class. Gym address
 *        required: true
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class updated successfully.
 *       400:
 *         description: Invalid request body. Must include all required parameters.
 *       404:
 *         description: Class Not Found
 */

/**
 * @swagger
 * /class/classID:
 *   delete:
 *     summary: Delete a single class.
 *     tags: [Class]
 *     security:
 *       - cookieAuth: []
 *     description: Deletes a single class from the database. Position needs to be admin.
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the class
 *        required: true
 *        schema:
 *           type: ObjectID
 *     responses:
 *       200:
 *         description: The class with id has been successfully deleted.
 *       400:
 *         description: Invalid class id.
 *       404:
 *         description: Class Not Found.
 *
 */

module.exports = router;
