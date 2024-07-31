const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");

var add_village = async (req, res, next, transaction) => {
  const { villageName, block_id } = req.body;

  const schema = Joi.object({
    villageName: Joi.string().max(50).required(),
    block_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  await transaction("villages").insert({ villageName, block_id });

  res.send({ status: "001", msg: "village added successfully." });
};

var get_villages = async(req,res,next,transaction)=>{
  const villages = await transaction("villages").select("id", "villageName")
  res.send({ status: "001", villages});
}


add_village = trycatch(add_village)
get_villages = trycatch(get_villages)

module.exports = {add_village, get_villages}


