const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const bcrypt = require("bcrypt");
const { trycatch } = require("../../utils/try_catch");
const jwt = require('jsonwebtoken')
const util = require('util')
const signAsync = util.promisify(jwt.sign)


var admin2_register = async (req, res, next, transaction) => {
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

  const existingUser = await transaction("admins")
    .where({ username })
    .first();
  if (existingUser) {
    //return res.send({ status: "002", message: "username already exists" });
    throw new CreateError("002", "username already exists");
  }

  const query = await transaction("admins").insert({
    username,
    password: hashedPassword,
  });

  res.send({ status: "001", message: "Admin added successfully" });
};

var admin2_login = async (req, res, next, transaction) => {
  const { username, password } = req.body;

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("002", error.details[0].message);
  }

  const query = await transaction("admins")
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
        private_key: process.env.secret_key,
      };
      try {
        const token = await signAsync(payload, process.env.secret_key);

        await transaction("admins")
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

var admin2_logout = async (req, res, next, transaction) => {
  const log = await transaction("admins")
    .where("id", req.admin2_id)
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

var get_gries = async(req,res,next,transaction)=>{
  const grievances = await transaction("grievances").select("*")
  res.send({status:"001",grievances})
}

var view_gries_by_id = async (req, res, next, transaction) => {
  const { grievance_id } = req.body;
  const schema = Joi.object({
    grievance_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }
  const grievance = await transaction("grievances")
    .select(
      "grievances.*",
      "districts.districtName",
      "blocks.blockName",
      "villages.villageName"
    )
    .leftJoin("districts", "grievances.district_id", "districts.id")
    .leftJoin("villages", "grievances.village_id", "villages.id")
    .leftJoin("blocks", "grievances.block_id", "blocks.id")
    .where("grievances.id", grievance_id);

  if (!grievance) {
    // return res.send({ status: "002", msg: "No record found" });
    throw new CreateError("002", "No record found");
  }
  res.status(200).json({ status: "001", grievance });
};

admin2_register = trycatch(admin2_register);
admin2_login = trycatch(admin2_login);
admin2_logout = trycatch(admin2_logout);
get_gries = trycatch(get_gries);
view_gries_by_id = trycatch(view_gries_by_id);


module.exports = { admin2_register, admin2_login, admin2_logout, get_gries, view_gries_by_id};
