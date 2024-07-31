const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");

var add_district = async (req, res, next, transaction) => {
  const { districtName } = req.body;

  const schema = Joi.object({
    districtName: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  await transaction("districts").insert({ districtName });

  res.send({ status: "001", msg: "District added successfully." });
};


add_district = trycatch(add_district)

module.exports = {add_district}


