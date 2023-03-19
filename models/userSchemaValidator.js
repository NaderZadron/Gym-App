const Joi = require("joi");

const userSchema = Joi.object({
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(4).max(40).required(),
  lastName: Joi.string().min(4).max(40).required(),
  address: Joi.string(),
  emailAddr: Joi.string().email().required(),
  position: Joi.string().valid("member", "coach", "admin").required(),
  attending: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
});

module.exports = userSchema;
