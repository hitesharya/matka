const Joi = require("joi");
const { trycatch } = require("../../utils/try_catch");
const { CreateError } = require("../../utils/create_err");

var addProject = async (req, res, next, transaction) => {
  var data = req.body;

  const schema = Joi.object({
    work_title: Joi.string().max(50).required(),
    category_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
      sub_cat_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
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
    start_date: Joi.date().required().allow("").allow(null),
    completion_date: Joi.date().required().allow("").allow(null),
    allotted_cost: Joi.number().min(1).required(),
    estimated_cost: Joi.number().min(1).required(),
    images: Joi.string().max(250).allow(""),
    lat: Joi.number().min(-90).max(90).required(),
    long: Joi.number().min(-180).max(180).required(),
    projectDetails: Joi.string().max(250).required(),
  });

  const { error } = await schema.validateAsync(data);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  var {
    sub_cat_id,
    work_title,
    category_id,
    district_id,
    block_id,
    village_id,
    start_date,
    completion_date,
    allotted_cost,
    estimated_cost,
    projectDetails,
    lat,
    long,
  } = req.body;

  const [project_id] = await transaction("projects").insert({
    user_id: req.official_id,
    remarks: projectDetails,
    category_id,
    sub_cat_id,
    district_id,
    block_id,
    village_id,
    start_date,
    completion_date,
    allotted_cost,
    estimated_cost,
    project_status: 0,
    lat,
    long,
    work_title,
  });

  if (!req.files) {
    throw new CreateError("FileUploadError", "upload atleast one image");
  }

  const imageFiles = req.files;

  for (let i = 0; i < 4 && i < imageFiles.length; i++) {
    let baseUrl = process.env.baseurl;
    baseUrl += "/projects/" + imageFiles[i].filename;
    const photoField = `photo${i + 1}`;
    await transaction("projects")
      .where("id", project_id)
      .update({ [photoField]: baseUrl });
  }

  res.send({ status: "002", message: "Project submitted successfully" });
};

var editProject = async (req, res, next, transaction) => {
  var data = req.body;

  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
    work_title: Joi.string().max(50).required(),
    category_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
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
    start_date: Joi.date().required().allow("").allow(null),
    completion_date: Joi.date().required().allow("").allow(null),
    allotted_cost: Joi.number().min(1).required(),
    estimated_cost: Joi.number().min(1).required(),
    images: Joi.string().max(250).allow(""),
    lat: Joi.number().min(-90).max(90).required(),
    long: Joi.number().min(-180).max(180).required(),
    projectDetails: Joi.string().max(250).required(),
  });

  const { error } = await schema.validateAsync(data);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  var {
    project_id,
    work_title,
    category_id,
    district_id,
    block_id,
    village_id,
    start_date,
    completion_date,
    allotted_cost,
    estimated_cost,
    projectDetails,
    lat,
    long,
  } = req.body;

  const update = await transaction("projects")
    .update({
      remarks: projectDetails,
      category_id,
      district_id,
      block_id,
      village_id,
      start_date,
      completion_date,
      allotted_cost,
      estimated_cost,
      project_status: 0,
      lat,
      long,
      work_title,
    })
    .where("id", project_id);

  if (!req.files) {
    throw new CreateError("FileUploadError", "upload atleast one image");
  }

  const imageFiles = req.files;

  for (let i = 0; i < 4 && i < imageFiles.length; i++) {
    let baseUrl = process.env.baseurl;
    baseUrl += "/projects/" + imageFiles[i].filename;
    const photoField = `photo${i + 1}`;
    await transaction("projects")
      .where("id", project_id)
      .update({ [photoField]: baseUrl });
  }

  if (!update) {
    throw new CreateError("002", "No project found.");
  }

  res.send({ status: "001", message: "Project edited successfully." });
};

var show_no_of_project = async (req, res, next, transaction) => {
  const counts = await transaction("projects")
    .select("project_status")
    .count("id as count")
    .groupBy("project_status");

  // Prepare response
  const projectCounts = {
    pending: 0,
    closed: 0,
    rejected: 0,
    completed:0
  };

  // Update response with counts
  counts.forEach((item) => {
    switch (item.project_status) {
      case 0:
        projectCounts.pending = item.count;
        break;
      case 1:
        projectCounts.closed = item.count;
        break;
      case 2:
        projectCounts.rejected = item.count;
        break;
        case 4:
        projectCounts.awarded = item.count;
    }
  });

  // Calculate total count
  projectCounts.total =
    projectCounts.pending + projectCounts.closed + projectCounts.rejected + projectCounts.awarded;

  res.status(200).json({ status: "001", projectCounts });
};

var show_all_projects = async (req, res, next, transaction) => {
  var projects = await transaction("projects").select("*");
  projects = projects.map((project) => {
    // Extract date part before 'T'
    var dateOnly = new Date(project.created_at);
    dateOnly = dateOnly.toISOString().split("T")[0];
    return { ...project, created_at: dateOnly };
  });
  res.status(200).json({ status: "001", projects });
};

var projects_by_type = async (req, res, next, transaction) => {
  const { project_status } = req.body;
  const schema = Joi.object({
    project_status: Joi.number().positive().required().valid(0, 1, 2, 3, 4), // 0 pending, 1 completed 2 rejected , 3 all, 4 awarded
    isOfficial: Joi.number().positive().required().valid(0, 1),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  switch (project_status) {
    case 0:
      var projects = await transaction("projects")
        .select("*")
        .where("project_status", 0)
        .where("user_id",req.user_id);
      break;
    case 1:
      var projects = await transaction("projects")
        .select("*")
        .where("project_status", 1)
        .where("user_id",req.user_id);
      break;
    case 2:
      var projects = await transaction("projects")
        .select("*")
        .where("project_status", 2)
        .where("user_id",req.user_id);
      break;
    case 3:
      var projects = await transaction("projects").select("*")
      .where("user_id",req.user_id);
      break;
      case 4:
      var projects = await transaction("projects")
        .select("*")
        .where("project_status", 4)
        .where("user_id",req.user_id);
      break;
    default:
      //res.status(400).send('Bad Request: Invalid type');
      throw new CreateError("002", "Invalid type");
  }

  if (projects.length == 0) {
    //  res.json({status:'002', msg:"No projects"});
    throw new CreateError("002", "No projects");
  }
  projects = projects.map((project) => {
    // Extract date part before 'T'
    var dateOnly = new Date(project.created_at);
    var startDate = new Date(project.start_date);
    var completionDate = new Date(project.completion_date);
    dateOnly = dateOnly.toISOString().split("T")[0];
    completionDate = completionDate.toISOString().split("T")[0];
    startDate = startDate.toISOString().split("T")[0];
    return { ...project, created_at: dateOnly, start_date:startDate, completion_date:completionDate };
  });
  res.status(200).json({ status: "001", projects });
};

var view_projects_by_id = async (req, res, next, transaction) => {
  const { project_id } = req.body;
  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
    isOfficial: Joi.number().positive().required().valid(0, 1),
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }
  var projects = await transaction("projects")
    .select(
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
    .where("projects.id", project_id);
  if (!projects) {
    // return res.send({status:'002',msg:"No record found"})
    throw new CreateError("002", "No record found");
  }
  projects = projects.map((project) => {
    // Extract date part before 'T'
    var dateOnly = new Date(project.created_at);
    var startDate = new Date(project.start_date);
    var completionDate = new Date(project.completion_date);
    dateOnly = dateOnly.toISOString().split("T")[0];
    completionDate = completionDate.toISOString().split("T")[0];
    startDate = startDate.toISOString().split("T")[0];
    return { ...project, created_at: dateOnly, start_date:startDate, completion_date:completionDate };
  });
  res.status(200).json({ status: "001", projects });
};

var update_project = async (req, res, next, transaction) => {
  var { project_id, lat, long, times } = req.body;

  const schema = Joi.object({
    project_id: Joi.number()
      .integer()
      .max(9007199254740991)
      .positive()
      .required(),
    lat: Joi.number().min(-90).max(90).required(),
    long: Joi.number().min(-180).max(180).required(),
    times:Joi.number().positive().required().valid(1, 2, 3)
  });

  times = parseInt(times);

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const update_geo = await transaction('projects').update({lat,long}).where("id", project_id);
  if(!update_geo){
    throw new CreateError("002", "No project found");
  }

  if (!req.file) {
    throw new CreateError("FileUploadError", "upload atleast one image");
  }

  let baseUrl = process.env.baseurl;
  baseUrl += "/projects/" + req.file.filename;
  const photoField = `photo${times + 1}`;
  await transaction('projects')
  .where("id", project_id)
  .update({[photoField]:baseUrl, times })

  res.send({ status: "002", message: "Photo updated successfully" });
};

addProject = trycatch(addProject);
show_no_of_project = trycatch(show_no_of_project);
show_all_projects = trycatch(show_all_projects);
projects_by_type = trycatch(projects_by_type);
view_projects_by_id = trycatch(view_projects_by_id);
editProject = trycatch(editProject);
update_project = trycatch(update_project);

module.exports = {
  addProject,
  show_no_of_project,
  show_all_projects,
  projects_by_type,
  view_projects_by_id,
  update_project,
  editProject,
};
