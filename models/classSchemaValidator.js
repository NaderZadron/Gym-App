const Joi = require("joi");

const classSchema = Joi.object({
  dateOfClass: Joi.string().required(),
  timeOfClass: Joi.string().required(),
  trainerName: Joi.string().required(),
  capacity: Joi.number().integer().positive().required(),
  typeOfClass: Joi.string().required(),
  location: Joi.string().required(),
  attendants: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
});

module.exports = classSchema;
