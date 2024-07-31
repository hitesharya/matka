const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");
const bcrypt = require("bcrypt");

var add_official = async (req, res, next, transaction) => {
  const { mobile, email, password, firstName, lastName, gender } = req.body;

  const schema = Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    gender: Joi.string().max(11).required().valid("Male", "Female", "Others"),
    email: Joi.string().max(50).required(),
    password: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await transaction("users").where({ mobile }).first();

  if (existingUser) {
    throw new CreateError("002", "user already exists");
  }

  const query = await transaction("users").insert({
    mobile,
    password: hashedPassword,
    email,
    firstName,
    lastName,
    status: 1,
    gender,
  });

  res.send({ status: "001", message: "Official added successfully" });
};

var update_pass_official = async (req, res, next, transaction) => {
  const { mobile, password } = req.body;

  const schema = Joi.object({
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    password: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await transaction("users").where({ mobile }).first();

  if (!existingUser) {
    throw new CreateError("002", "Official does not exist");
  }

  const query = await transaction("users").update({
    password: hashedPassword,
  }).where("mobile",mobile)

  res.send({ status: "001", message: "Password updated successfully" });
};

var delete_official = async (req, res, next, transaction) => {
  const user_id = req.params.user_id;

  const existingUser = await transaction("users").where("id", user_id).first();

  if (!existingUser) {
    // return res
    //   .status(400)
    //   .send({ status: "002", message: "Official do not exist" });
    throw new CreateError("002", "Official do not exist");
  }

  await transaction("users").delete().where("id", user_id);

  res.send({ status: "001", message: "Official deleted successfully" });
};

var delete_citizen = async (req, res, next, transaction) => {
  const user_id = req.params.user_id;

  const existingUser = await transaction("users").where("id", user_id).first();

  if (!existingUser) {
    // return res
    //   .status(400)
    //   .send({ status: "002", message: "citizen do not exist" });
    throw new CreateError("002", "citizen do not exist");
  }

  await transaction("users").delete().where("id", user_id);

  res.send({ status: "001", message: "Citizen deleted successfully" });
};

var no_all_users = async (req, res, next, transaction) => {
  const counts = await transaction("users")
    .select(
      transaction.raw(
        "SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as citizens_count"
      )
    )
    .select(
      transaction.raw(
        "SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as officials_count"
      )
    )
    .count("id as total_count");

  const { total_count, citizens_count, officials_count } = counts[0];

  const responseData = {
    total_users: total_count,
    citizens: citizens_count,
    officials: officials_count,
  };

  res.send({ status: "001", responseData });
};

var show_all_officials = async (req, res, next, transaction) => {
  const officials = await transaction("users").select("*").where("status", 1);
  res.send({ status: "001", officials });
};

var show_all_citizens = async (req, res, next, transaction) => {
  const citizens = await transaction("users").select("*").where("status", 0);
  res.send({ status: "001", citizens });
};

var get_admin2 = async (req, res, next, transaction) => {
  const admins = await transaction("admins").select("*");
  res.send({ status: "001", admins });
};

var delete_admin = async(req,res,next,transaction)=>{
  const {admin_id} = req.body

  const schema = Joi.object({
    admin_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  await transaction("admins").delete().where("id",admin_id);
  res.send({status:'001', message:"Admin deleted Sucessfully."})
}

add_official = trycatch(add_official);
delete_citizen = trycatch(delete_citizen);
delete_official = trycatch(delete_official);
no_all_users = trycatch(no_all_users);
show_all_officials = trycatch(show_all_officials);
show_all_citizens = trycatch(show_all_citizens);
get_admin2 = trycatch(get_admin2);
update_pass_official = trycatch(update_pass_official);
delete_admin = trycatch(delete_admin);

module.exports = {
  delete_admin,
  add_official,
  delete_citizen,
  delete_official,
  no_all_users,
  show_all_officials,
  show_all_citizens,
  get_admin2,
  update_pass_official
};
