const Joi = require("joi");
const { CreateError } = require("../../utils/create_err");
const { trycatch } = require("../../utils/try_catch");

var dashboard = async (req, res, next, transaction) => {
  const users_counts = await transaction("users")
    .select("status")
    .count("id as count")
    .groupBy("status");

  //prepare response
  const userCounts = {
    official: 0,
    citizen: 0,
    total:0
  };

  users_counts.forEach((item) => {
    switch (item.status) {
      case 1:
        userCounts.official = item.count;
        break;
      case 0:
        userCounts.citizen = item.count;
        break;
    }

     // Calculate total count
  userCounts.total =
  userCounts.official + userCounts.citizen
  });

  const recentProjects = await transaction("projects")
    .select("*")
    .orderBy("created_at", "desc")
    .limit(6);

  const projectCounts = await transaction("projects")
    .select("project_status")
    .count("id as count")
    .groupBy("project_status");

  // Prepare response
  const projects_counts = {
    pending: 0,
    closed: 0,
    rejected: 0,
    total:0
  };
  // Update response with counts
  projectCounts.forEach((item) => {
    switch (item.project_status) {
      case 0:
        projects_counts.pending = item.count;
        break;
      case 1:
        projects_counts.closed = item.count;
        break;
      case 2:
        projects_counts.rejected = item.count;
        break;
    }
  });

  // Calculate total count
  projects_counts.total =
    projects_counts.pending + projects_counts.closed + projects_counts.rejected;

  const recentGrievances = await transaction("grievances")
    .select("*")
    .orderBy("created_at", "desc")
    .limit(3);

  const grie_counts = await transaction("grievances")
    .select("grievance_status")
    .count("id as count")
    .groupBy("grievance_status");

  // Prepare response
  const grievanceCounts = {
    pending: 0,
    closed: 0,
    rejected: 0,
    total:0
  };

  // Update response with counts
  grie_counts.forEach((item) => {
    switch (item.grievance_status) {
      case 0:
        grievanceCounts.pending = item.count;
        break;
      case 1:
        grievanceCounts.closed = item.count;
        break;
      case 2:
        grievanceCounts.rejected = item.count;
        break;
    }
  });

  // Calculate total count
  grievanceCounts.total =
    grievanceCounts.pending + grievanceCounts.closed + grievanceCounts.rejected;

  res.send({
      status: "001",
      projects_counts,
      recentProjects,
      grievanceCounts,
      recentGrievances,
      userCounts
    });
};

var add_category = async(req,res,next,transaction)=>{
  const { category } = req.body;

  const schema = Joi.object({
    category: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  await transaction("categories").insert({ category });

  res.send({ status: "001", msg: "Category added successfully." });
}

var add_sub_cat = async(req,res,next,transaction)=>{
  const { sub_category } = req.body;

  const schema = Joi.object({
    sub_category: Joi.string().max(50).required(),
  });

  const { error } = await schema.validateAsync(req.body);

  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  await transaction("sub_categories").insert({ sub_category });

  res.send({ status: "001", msg: "Sub Category added successfully." });
}

dashboard = trycatch(dashboard);
add_category = trycatch(add_category);
add_sub_cat = trycatch(add_sub_cat);

module.exports = { dashboard ,add_category, add_sub_cat};
