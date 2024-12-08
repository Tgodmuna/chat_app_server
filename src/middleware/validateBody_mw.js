const joi = require("joi");
const { getNames } = require("country-list");

const country = getNames();

module.exports = function validatebody(req, res, next) {
  const { error } = bodySchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

const bodySchema = joi.object({
  name: joi.string().min(6).required().trim(true),
  email: joi.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required,
  password: joi
    .string()
    .min(8)
    .required()
    .trim(true)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  location: joi
    .object({
      city: joi.string().min(2).required(),
      state: joi.string().required(),
      country: joi
        .string()
        .valid(...country)
        .required(),
    })
    .required(),
  age: joi.number().required(),
  phone: joi.string().min(11).required(),
  gender: joi.string().valid("male", "female").required(),
  status: joi.string(),
  role: joi.string().valid("admin", "user").required(),
});
