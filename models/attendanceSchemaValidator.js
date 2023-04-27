const Joi = require("joi");

const attendanceSchema = Joi.object({
  user: Joi.string().required(),
  class: Joi.string().required(),
  date: Joi.date().default(Date.now),
  checkedIn: Joi.boolean().default(false),
});

module.exports = attendanceSchema;
