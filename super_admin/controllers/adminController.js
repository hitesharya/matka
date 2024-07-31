const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const bcrypt = require("bcrypt");
const { trycatch } = require("../../utils/try_catch");
const jwt = require('jsonwebtoken')
const util = require('util')
const signAsync = util.promisify(jwt.sign)


var admin_register = async (req, res, next, transaction) => {
  const { username, password } = req.body;

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await transaction("super_admins")
    .where({ username })
    .first();
  if (existingUser) {
    //return res.send({ status: "002", message: "username already exists" });
    throw new CreateError("002", "username already exists");
  }

  const query = await transaction("super_admins").insert({
    username,
    password: hashedPassword,
  });

  res.send({ status: "001", message: "Admin added successfully" });
};

var admin_login = async (req, res, next, transaction) => {
  const { username, password } = req.body;

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("002", error.details[0].message);
  }

  const query = await transaction("super_admins")
    .select("*")
    .where("username", username)
    .first();

  if (!query) {
   return res.send({ status: "002", message: "Username is not Registered" });
  } else {
    const isMatch = bcrypt.compareSync(password, query.password);

    if (isMatch) {
      const payload = {
        id: query.id,
        private_key: process.env.admin_key,
      };
      try {
        const token = await signAsync(payload, process.env.admin_key);

        await transaction("super_admins")
          .where({ id: query.id })
          .update({ token: token });

        return res.send({
          status: "001",
          message: "Login successful",
          token: token,
          name: query.username,
        });
      } catch (err) {
       return res.send({ status: "002", message: "error occured" });
      }
    } else {
     return res.send({ status: "002", message: "Incorrect password" });
    }
  }
};

var admin_logout = async (req, res, next, transaction) => {
  const log = await transaction("super_admins")
    .where("id", req.admin_id)
    .update({ token: null });

  if (!log) {
   return res.send({
      status: "002",
      message: "Internal Server Error",
    });
  } else {
    return res.send({
      status: "001",
      message: "logout successfull",
    });
  }
};

admin_register = trycatch(admin_register);
admin_login = trycatch(admin_login);
admin_logout = trycatch(admin_logout);


module.exports = { admin_register, admin_login, admin_logout};
