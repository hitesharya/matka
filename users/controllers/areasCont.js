const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");

var get_villages_by_blockId = async(req,res,next,transaction)=>{

    const {block_id} = req.body

    const schema = Joi.object({
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

  const villages = await transaction("villages").select("id", "villageName").where("block_id", block_id)
  res.send({ status: "001", villages});
}

var get_blocks = async(req,res,next,transaction)=>{
    const blocks = await transaction("blocks").select("id", "blockName")
  res.send({ status: "001", blocks});
}

var get_category = async(req,res,next,transaction)=>{
  const category = await transaction("categories").select("id", "category")
res.send({ status: "001", category});
}

var get_sub_category = async(req,res,next,transaction)=>{
  const sub_category = await transaction("sub_categories").select("id", "sub_category")
res.send({ status: "001", sub_category});
}


get_villages_by_blockId = trycatch(get_villages_by_blockId)
get_blocks = trycatch(get_blocks)
get_category = trycatch(get_category)
get_sub_category = trycatch(get_sub_category)

module.exports = {get_villages_by_blockId, get_blocks, get_category, get_sub_category}


