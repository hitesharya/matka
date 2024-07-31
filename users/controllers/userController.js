const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");
const util = require("util");
const jwt = require("jsonwebtoken");
const signAsync = util.promisify(jwt.sign);
const bcrypt = require("bcrypt");

var registration = async (req, res, next, transaction) => {
  const {
    firstName,
    lastName,
    mobile,
    email,
    gender,
    block_id,
    village_id,
    district_id,
  } = req.body;

  const schema = Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    email: Joi.string().max(50).required(),
    gender: Joi.string().max(11).required().valid("Male", "Female", "Others"),
    district_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
    block_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
    village_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const existingUser = await transaction("users").where({ mobile }).first();
  if (existingUser) {
    // return res
    //   .status(400)
    //   .send({ status: 0, message: "This mobile number is already registered" });
    throw new CreateError("002", "This mobile number is already registered");
  }

  const query = await transaction("users").insert({
    mobile,
    email,
    firstName,
    lastName,
    gender,
    district_id,
    block_id,
    village_id,
    status: 0,
  });

  res.send({ status: "001", message: "users added successfully" });
};

var userLogin = async (req, res, next, transaction) => {
  var { mobile, isOfficial, password } = req.body;

  // isOfficial = parseInt(isOfficial);

  const schema = Joi.object({
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    password: Joi.string().max(50).when("isOfficial", {
      is: 1,
      then: Joi.required(), // Password required only for officials
      otherwise: Joi.forbidden(), // Password forbidden for citizens
    }),
    isOfficial: Joi.number().integer().min(0).max(1).required(), // 1 for official, 0 for citizen
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const user = await transaction("users")
    .select("*")
    .where("mobile", mobile)
    .first();

  if (!user) {
    // return res.send({ status: "002", message: "Mobile is not Registered" });
    throw new CreateError("002", "Mobile is not Registered");
  }

  // Verify password for official users
  if (isOfficial && !bcrypt.compareSync(password, user.password)) {
    //return res.status(400).json({ status: "002", message: "Incorrect password" });
    throw new CreateError("002", "Incorrect password");
  }

  // Prepare payload for JWT
  const payload = {
    id: user.id,
    private_key: isOfficial
      ? process.env.official_key
      : process.env.citizen_key,
    isOfficial: user.status,
  };

  // Generate JWT token
  const token = await signAsync(payload, payload.private_key);

  // Update user token in the database
  await transaction("users").where({ id: user.id }).update({ token });

  // Send response
  return res.send({
    status: "001",
    token,
    username: user.firstName,
    isOfficial: user.status,
  });
};

var userLogout = async (req, res, next, transaction) => {
  const update = await transaction("users")
    .update({ token: null })
    .where("id", req.user_id);
  res.send({
    status: "001",
    message: "Logout successfully",
  });
};

var delete_user = async (req, res, next, transaction) => {
  const { mobile } = req.body;

  const schema = Joi.object({
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const existingUser = await transaction("users").where({ mobile }).first();
  if (!existingUser) {
    throw new CreateError("002", "This mobile number is does not exist");
  }

  const deleteUser = await transaction("users")
    .delete()
    .where("mobile", mobile);

  res.send({ status: "001", message: "User deleted successfully" });
};


registration = trycatch(registration);
userLogin = trycatch(userLogin);
userLogout = trycatch(userLogout);
delete_user = trycatch(delete_user);

module.exports = { registration, userLogin, userLogout, delete_user };
