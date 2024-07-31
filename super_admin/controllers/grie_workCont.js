const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");

// var get_grievances = async (req, res, next, transaction) => {

//   const schema = Joi.object({
//     type: Joi.number().positive().required().valid(0, 1, 2, 3),
//   });

//   const { error } = await schema.validateAsync(req.body);
//   if (error) {
//     throw new CreateError("ValidationError", error.details[0].message);
//   }

//   const type = parseInt(req.body.type);

//   const grievanceQuery = transaction("grievances")
//     .select(
//       "grievances.*",
//       "districts.districtName",
//       "blocks.blockName",
//       "villages.villageName"
//     )
//     .leftJoin("districts", "grievances.district_id", "districts.id")
//     .leftJoin("villages", "grievances.village_id", "villages.id")
//     .leftJoin("blocks", "grievances.block_id", "blocks.id");

//   if (type !== 3) { // Only add status filter for non-all cases
//     grievanceQuery.where("grievance_status", type);
//   }

//   const grievances = await grievanceQuery;

//   if (!grievances.length) {
//     return res.send({ status: "001", grievances });
//   }

//   grievances.forEach((grievance) => {
//     grievance.created_at = grievance.created_at.toISOString().split('T')[0];
//   }); // More concise date formatting

//   res.send({ status: "001", grievances });

// };

// var get_projects = async (req, res, next, transaction) => {

//   const schema = Joi.object({
//     type: Joi.number().positive().required().valid(0, 1, 2, 3),
//   });

//   const { error } = await schema.validateAsync(req.body);
//   if (error) {
//     throw new CreateError("ValidationError", error.details[0].message);
//   }

//   const type = parseInt(req.body.type);

//   const projectQuery = await transaction("projects")
//     .select(
//       "projects.*",
//       "districts.districtName",
//       "blocks.blockName",
//       "villages.villageName"
//     )
//     .leftJoin("districts", "projects.district_id", "districts.id")
//     .leftJoin("villages", "projects.village_id", "villages.id")
//     .leftJoin("blocks", "projects.block_id", "blocks.id");

//     console.log(projectQuery);

//   if (type !== 3) { // Only add status filter for non-all cases
//     projectQuery.where("project_status", type);
//   }

//   const projects = await projectQuery;

//   if (!projects.length) {
//     return res.send({ status: "001", projects });
//   }

//   projects.forEach((project) => {
//     project.created_at = project.created_at.toISOString().split('T')[0];
//   }); // More concise date formatting

//   res.send({ status: "001", projects });

// }

var get_grievances = async (req, res, next, transaction) => {
  var { type } = req.body;
  const schema = Joi.object({
    type: Joi.number().positive().required().valid(0, 1, 2, 3, 4), // 0 pending, 1 closed, 2 rejected, 3 all, 4 progress
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  type = parseInt(type);

  switch (type) {
    case 0:
      var grievances = await transaction("grievances")
        .select(
          "grievances.*",
          "districts.districtName",
          "blocks.blockName",
          "villages.villageName"
        )
        .leftJoin("districts", "grievances.district_id", "districts.id")
        .leftJoin("villages", "grievances.village_id", "villages.id")
        .leftJoin("blocks", "grievances.block_id", "blocks.id")
        .where("grievance_status", 0)
      
        break;
    case 1:
      var grievances = await transaction("grievances")
        .select(
          "grievances.*",
          "districts.districtName",
          "blocks.blockName",
          "villages.villageName"
        )
        .leftJoin("districts", "grievances.district_id", "districts.id")
        .leftJoin("villages", "grievances.village_id", "villages.id")
        .leftJoin("blocks", "grievances.block_id", "blocks.id")
        .where("grievance_status", 1)
        
      break;
    case 2:
      var grievances = await transaction("grievances")
        .select(
          "grievances.*",
          "districts.districtName",
          "blocks.blockName",
          "villages.villageName"
        )
        .leftJoin("districts", "grievances.district_id", "districts.id")
        .leftJoin("villages", "grievances.village_id", "villages.id")
        .leftJoin("blocks", "grievances.block_id", "blocks.id")
        .where("grievance_status", 2)
        

      break;
    case 3:
      var grievances = await transaction("grievances")
        .select(
          "grievances.*",
          "districts.districtName",
          "blocks.blockName",
          "villages.villageName"
        )
        .leftJoin("districts", "grievances.district_id", "districts.id")
        .leftJoin("villages", "grievances.village_id", "villages.id")
        .leftJoin("blocks", "grievances.block_id", "blocks.id")
        
      break;
      case 4:
      var grievances = await transaction("grievances")
        .select(
          "grievances.*",
          "districts.districtName",
          "blocks.blockName",
          "villages.villageName"
        )
        .leftJoin("districts", "grievances.district_id", "districts.id")
        .leftJoin("villages", "grievances.village_id", "villages.id")
        .leftJoin("blocks", "grievances.block_id", "blocks.id")
        .where("grievance_status", 4)
      
        break;
    default:
      throw new CreateError("002", "Invalid type");
  }

  res.status(200).json({ status: "001", grievances });
}

var get_projects = async(req,res,next,transaction)=>{
  
  var { type } = req.body;
  const schema = Joi.object({
      type: Joi.number().positive().required().valid(0, 1, 2, 3, 4), // 0 pending, 1 completed 2 rejected, 4 awarded
    });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  type = parseInt(type);

  switch (type) {
    case 0:
      var projects = await transaction('projects').select(
        "projects.*",
        "districts.districtName",
        "blocks.blockName",
        "villages.villageName",
        "categories.category",
        "sub_categories.sub_category"
      )
      .leftJoin("districts", "projects.district_id", "districts.id")
      .leftJoin("villages", "projects.village_id", "villages.id")
      .leftJoin("blocks", "projects.block_id", "blocks.id")
      .leftJoin("categories", "projects.category_id", "categories.id")
      .leftJoin("sub_categories", "projects.sub_cat_id", "sub_categories.id")
      .where('project_status',0)
        break;
    case 1:
      var projects = await transaction('projects').select(
        "projects.*",
        "districts.districtName",
        "blocks.blockName",
        "villages.villageName",
        "categories.category",
        "sub_categories.sub_category"
      )
      .leftJoin("districts", "projects.district_id", "districts.id")
      .leftJoin("villages", "projects.village_id", "villages.id")
      .leftJoin("blocks", "projects.block_id", "blocks.id")
      .leftJoin("categories", "projects.category_id", "categories.id")
      .leftJoin("sub_categories", "projects.sub_cat_id", "sub_categories.id")
      .where('project_status',1)
        break;
    case 2:
      var projects = await transaction('projects').select(
        "projects.*",
        "districts.districtName",
        "blocks.blockName",
        "villages.villageName",
        "categories.category",
        "sub_categories.sub_category"
      )
      .leftJoin("districts", "projects.district_id", "districts.id")
      .leftJoin("villages", "projects.village_id", "villages.id")
      .leftJoin("blocks", "projects.block_id", "blocks.id")
      .leftJoin("categories", "projects.category_id", "categories.id")
      .leftJoin("sub_categories", "projects.sub_cat_id", "sub_categories.id")
      .where('project_status',2)
        break;
        case 3:
      var projects = await transaction('projects').select(
        "projects.*",
        "districts.districtName",
        "blocks.blockName",
        "villages.villageName",
        "categories.category",
        "sub_categories.sub_category"
      )
      .leftJoin("districts", "projects.district_id", "districts.id")
      .leftJoin("villages", "projects.village_id", "villages.id")
      .leftJoin("blocks", "projects.block_id", "blocks.id")
      .leftJoin("categories", "projects.category_id", "categories.id")
      .leftJoin("sub_categories", "projects.sub_cat_id", "sub_categories.id");
        break;
        case 4:
      var projects = await transaction('projects').select(
        "projects.*",
        "districts.districtName",
        "blocks.blockName",
        "villages.villageName",
        "categories.category",
        "sub_categories.sub_category"
      )
      .leftJoin("districts", "projects.district_id", "districts.id")
      .leftJoin("villages", "projects.village_id", "villages.id")
      .leftJoin("blocks", "projects.block_id", "blocks.id")
      .leftJoin("categories", "projects.category_id", "categories.id")
      .leftJoin("sub_categories", "projects.sub_cat_id", "sub_categories.id")
      .where('project_status',4)
        break;
    default:
        //res.status(400).send('Bad Request: Invalid type');
        throw new CreateError("002", "Invalid type");
}

  res.status(200).json({status:'001',projects});
}

var reject_grievance = async (req, res, next, transaction) => {
  var { grievance_id } = req.body;

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

  const updateResult = await transaction("grievances")
    .where("id", grievance_id)
    .update({ grievance_status: 2 });

  if (!updateResult) {
    //return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No grievance found");
  }

  res.send({ status: "002", msg: "Grievance rejected successfully" });
};

var progress_grievance = async (req, res, next, transaction) => {
  var { grievance_id } = req.body;

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

  const update = await transaction("grievances")
    .where("id", grievance_id)
    .update({ grievance_status: 4 });

  if (!update) {
  //  return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No grievance found");
  }

  res.send({ status: "002", msg: "Grievance accepted successfully" });
};

var close_grievance = async (req, res, next, transaction) => {
  var { grievance_id } = req.body;

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

  const update = await transaction("grievances")
    .where("id", grievance_id)
    .update({ grievance_status: 1 });

  if (!update) {
  //  return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No grievance found");
  }

  res.send({ status: "002", msg: "Grievance closed successfully" });
};

var award_project = async (req, res, next, transaction) => {
  var { project_id } = req.body;

  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const update = await transaction("projects")
    .where("id", project_id)
    .update({ project_status: 4 });

  if (!update) {
   // return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No project found");
  }

  res.send({ status: "002", msg: "Project awarded successfully" });
};

var complete_project = async (req, res, next, transaction) => {
  var { project_id } = req.body;

  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const update = await transaction("projects")
    .where("id", project_id)
    .update({ project_status: 1 });

  if (!update) {
   // return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No project found");
  }

  res.send({ status: "002", msg: "Project completed successfully" });
};

var reject_project = async (req, res, next, transaction) => {
  var { project_id } = req.body;

  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const update = await transaction("projects")
    .where("id", project_id)
    .update({ project_status: 2 });

  if (!update) {
    //return res.send({ status: "002", msg: "Invalid request" });
    throw new CreateError("002", "No project found");
  }

  res.send({ status: "002", msg: "Project rejected successfully" });
};

get_grievances = trycatch(get_grievances);
get_projects = trycatch(get_projects);
reject_project = trycatch(reject_project);
reject_grievance = trycatch(reject_grievance);
complete_project = trycatch(complete_project);
close_grievance = trycatch(close_grievance);
award_project = trycatch(award_project)
progress_grievance = trycatch(progress_grievance)

module.exports = {
  award_project,
  get_grievances,
  get_projects,
  reject_grievance,
  reject_project,
  complete_project,
  close_grievance,
  progress_grievance,
};
