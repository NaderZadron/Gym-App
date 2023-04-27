const express = require("express");
const router = express.Router();
const Class = require("../models/class");
const User = require("../models/user");
const Attendance = require("../models/attendance");
const classSchemaValidator = require("../models/classSchemaValidator");
const attendanceSchemaValidator = require("../models/attendanceSchemaValidator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAdmin } = require("../middleware/isAdmin");
const authJwtController = require("../middleware/auth_jwt");

router
  .route("/")
  .get(async (req, res, next) => {
    console.log(req.cookies);

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
  .post(
    authJwtController.isAuthenticated,
    isAdmin(),
    async (req, res, next) => {
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
    }
  );

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
  .put(authJwtController.isAuthenticated, isAdmin(), async (req, res, next) => {
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
      console.log(req.cookies);

      return res
        .status(200)
        .json({ message: "Class updated successfully", data: updatedClass });
    } catch (err) {
      next(err);
    }
  })
  .delete(
    authJwtController.isAuthenticated,
    isAdmin(),
    async (req, res, next) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ error: "Invalid class ID" });
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
    }
  );

router.post(
  "/:id/register",
  authJwtController.isAuthenticated,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid class ID" });
      }
      const token = req.headers.authorization.split(" ")[1]; // get the token from the authorization header
      const decoded = jwt.verify(token, process.env.SECRET_KEY); // verify the token
      const userId = decoded.id; // get the user ID from the token
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const classId = req.params.id;
      const classs = await Class.findById(classId);
      if (!classs) {
        return res.status(404).json({ error: "Class not found" });
      }
      var classAttendance = {
        user: user.id,
        class: classs.id,
      };
      const { error, value } =
        attendanceSchemaValidator.validate(classAttendance);
      if (error) {
        return res.status(400).json({
          message: "Invalid request body",
          error: error.details[0].message,
        });
      }

      const savedAttendance = new Attendance(value);
      await savedAttendance.save();

      res.status(200).json({
        message: "User successfully registered to the class",
        db: savedAttendance,
      });
    } catch (error) {
      console.log(error);
      next(error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }
);

router.get(
  "/:id/users",
  authJwtController.isAuthenticated,
  async (req, res, next) => {
    try {
      const classId = req.params.id;
      const attendanceRecords = await Attendance.find({
        class: classId,
      }).exec();
      if (attendanceRecords.length === 0) {
        return res.status(404).json({
          message: "Attendance records not found",
        });
      }
      // Extract the user IDs from the attendance records
      const userIds = attendanceRecords.map((record) => record.user);
      const users = await User.find({ _id: { $in: userIds } }).exec();
      if (users.length === 0) {
        res.status(404).json({
          message: "Users not found",
        });
      }
      res.status(200).json({
        message: "All users registered for this class",
        data: users,
      });
    } catch (error) {
      console.log(error);
      next(error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }
);

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

/**
 * @swagger
 * /class/:classId/register:
 *   post:
 *     summary: User registers for a class.
 *     tags: [Class]
 *     security:
 *       - cookieAuth: []
 *     description: Allows user to register for a class. User needs to be logged in.
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the class
 *        required: true
 *        schema:
 *           type: ObjectID
 *     responses:
 *       200:
 *         description: User successfully registered for the class.
 *       400:
 *         description: Missing class id or user id in request.
 *       404:
 *         description: Class or User not found.
 *
 */

/**
 * @swagger
 * /class/:classId/users:
 *   get:
 *     summary: Return all users registered for a class
 *     tags: [Class]
 *     security:
 *       - cookieAuth: []
 *     description: Returns all of the users registered for this class in a array of objects.
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the class
 *        required: true
 *        schema:
 *           type: ObjectID
 *     responses:
 *       200:
 *         description: List of users sent
 *       400:
 *         description: Missing class id.
 *       404:
 *         description: Class or User not found.
 *
 */

module.exports = router;
