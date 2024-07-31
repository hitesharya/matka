const Joi = require("joi");
const { trycatch } = require("../../utils/try_catch");
const { CreateError } = require("../../utils/create_err");

var addGrievance = async (req, res, next, transaction) => {
  var data = req.body;

  const schema = Joi.object({
    grie_title: Joi.string().max(50).required(),
    grievance_type: Joi.number().valid(0, 1, 2).required(),
    grievanceDetails: Joi.string().max(250).required(),
    is_similar_grievance: Joi.number().valid(0, 1).required(),
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
    lat: Joi.number().min(-90).max(90).required(),
    long: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(250).required(),
    images: Joi.string().max(250).allow(""),
  });

  const { error } = await schema.validateAsync(data);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  var {
    grie_title,
    grievance_type,
    grievanceDetails,
    is_similar_grievance,
    district_id,
    block_id,
    village_id,
    address,
    long,
    lat,
  } = req.body;

  const [grievance_id] = await transaction("grievances").insert({
    user_id: req.citizen_id,
    type: grievance_type,
    grievance_details: grievanceDetails,
    address_details: address,
    district_id,
    block_id,
    village_id,
    grievance_status: 0,
    is_similar_grievance,
    lat,
    long,
    grie_title,
  });

  const imageFiles = req.files;

  if (imageFiles) {
    for (let i = 0; i < 4 && i < imageFiles.length; i++) {
      let baseUrl = process.env.baseurl;
      baseUrl += "/grievances/" + imageFiles[i].filename;
      const photoField = `photo${i + 1}`;
      await transaction("grievances")
        .where("id", grievance_id)
        .update({ [photoField]: baseUrl });
    }
  }

  res.send({ status: "002", message: "Grievance submitted successfully" });
};

var check_api = async (req, res, next, transaction) => {
  var { isOfficial } = req.body;

  isOfficial = parseInt(isOfficial);

  const schema = Joi.object({
    isOfficial: Joi.number().positive().required().valid(0, 1), // 0 citizen, 1 isOfficial
  });

  const { error } = await schema.validateAsync(req.body);
  if (error) {
    throw new CreateError("ValidationError", error.details[0].message);
  }

  const user = await transaction("users")
    .select("*")
    .where("id", req.user_id)
    .first();

  if (user.status == 1) {
    // Fetch recent projects
    var recentProjects = await transaction("projects")
      .select("*")
      .where("user_id", req.user_id)
      .orderBy("created_at", "desc")
      .limit(3);

    recentProjects = recentProjects.map((project) => {
      // Extract date part before 'T'
      var dateOnly = new Date(project.created_at);
      var startDate = new Date(project.start_date);
      var completionDate = new Date(project.completion_date);
      dateOnly = dateOnly.toISOString().split("T")[0];
      completionDate = completionDate.toISOString().split("T")[0];
      startDate = startDate.toISOString().split("T")[0];
      return {
        ...project,
        created_at: dateOnly,
        start_date: startDate,
        completion_date: completionDate,
      };
    });

    const counts = await transaction("projects")
      .select("project_status")
      .where("user_id", req.user_id)
      .count("id as count")
      .groupBy("project_status");

    // Prepare response
    const projects_counts = {
      pending: 0,
      closed: 0,
      rejected: 0,
      awarded:0,
    };

    // Update response with counts
    counts.forEach((item) => {
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
          case 4:
            projects_counts.awarded = item.count;
          break;

      }
    });

    // Calculate total count
    projects_counts.total =
      projects_counts.pending +
      projects_counts.closed +
      projects_counts.rejected +
      projects_counts.awarded;

    return res.send({ status: "001", projects_counts, recentProjects, user });
  } else {
    // Fetch recent grievances
    const recentGrievances = await transaction("grievances")
      .select("*")
      .where("user_id", req.user_id)
      .orderBy("created_at", "desc")
      .limit(3);

    recentGrievances.forEach((grievance) => {
      grievance.created_at = grievance.created_at.toISOString().split("T")[0];
    });

    const counts = await transaction("grievances")
      .select("grievance_status")
      .where("user_id", req.user_id)
      .count("id as count")
      .groupBy("grievance_status");

    // Prepare response
    const grievanceCounts = {
      pending: 0,
      closed: 0,
      rejected: 0,
    };

    // Update response with counts
    counts.forEach((item) => {
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
      grievanceCounts.pending +
      grievanceCounts.closed +
      grievanceCounts.rejected;

    res.send({ status: "001", grievanceCounts, recentGrievances, user });
  }
};

var show_all_grievances = async (req, res, next, transaction) => {
  const grievances = await transaction("grievances").select("*");
  grievances.forEach((grievance) => {
    grievance.created_at = grievance.created_at.toISOString().split("T")[0];
  });
  res.send({ status: "001", grievances });
};

var grievances_by_type = async (req, res, next, transaction) => {
  var { type } = req.body;
  const schema = Joi.object({
    type: Joi.number().positive().required().valid(0, 1, 2, 3, 4), // 0 pending, 1 closed 2 rejected 3 all
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
        .andWhere("user_id", req.citizen_id);
      grievances = grievances.map((grievance) => {
        // Extract date part before 'T'
        var dateOnly = new Date(grievance.created_at);
        dateOnly = dateOnly.toISOString().split("T")[0];
        return { ...grievance, created_at: dateOnly };
      });
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
        .andWhere("user_id", req.citizen_id);
      grievances = grievances.map((grievance) => {
        // Extract date part before 'T'
        var dateOnly = new Date(grievance.created_at);
        dateOnly = dateOnly.toISOString().split("T")[0];
        return { ...grievance, created_at: dateOnly };
      });
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
        .andWhere("user_id", req.citizen_id);
      grievances = grievances.map((grievance) => {
        // Extract date part before 'T'
        var dateOnly = new Date(grievance.created_at);
        dateOnly = dateOnly.toISOString().split("T")[0];
        return { ...grievance, created_at: dateOnly };
      });

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
        .where("user_id", req.citizen_id);

      grievances = grievances.map((grievance) => {
        // Extract date part before 'T'
        var dateOnly = new Date(grievance.created_at);
        dateOnly = dateOnly.toISOString().split("T")[0];
        return { ...grievance, created_at: dateOnly };
      });
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
        .andWhere("user_id", req.citizen_id);
      grievances = grievances.map((grievance) => {
        // Extract date part before 'T'
        var dateOnly = new Date(grievance.created_at);
        dateOnly = dateOnly.toISOString().split("T")[0];
        return { ...grievance, created_at: dateOnly };
      });
      break;
    default:
      // res.json({ status: "002", msg: "Invalid type" });
      throw new CreateError("002", "Invalid type");
  }

  if (grievances.length == 0) {
    //  res.json({ status: "002", msg: "No grievances" });
    throw new CreateError("002", "No grievances");
  }
  // grievances.forEach((grievance) => {
  //   grievance.created_at = grievance.created_at.toISOString().split('T')[0];
  // });
  grievances = grievances.map((grievance) => {
    // Extract date part before 'T'
    var dateOnly = new Date(grievance.created_at);
    dateOnly = dateOnly.toISOString().split("T")[0];
    return { ...grievance, created_at: dateOnly };
  });
  res.status(200).json({ status: "001", grievances });
};

var view_grievance_by_id = async (req, res, next, transaction) => {
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
      "users.firstName",
      "users.lastName",
      "users.mobile",
      "users.email",
      "districts.districtName",
      "blocks.blockName",
      "villages.villageName"
    )
    .leftJoin("users", "grievances.user_id", "users.id")
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

// var closed_grievances = async(req,res,next,transaction)=>{
//   const grievances = await transaction('grievances').select('*').where('grievance_status',1)
//   res.status(200).json({status:'001',grievances});
// }

// var rejected_grievances = async(req,res,next,transaction)=>{
//   const grievances = await transaction('grievances').select('*').where('grievance_status',2)
//   res.status(200).json({status:'001',grievances});
// }

addGrievance = trycatch(addGrievance);
check_api = trycatch(check_api);
show_all_grievances = trycatch(show_all_grievances);
grievances_by_type = trycatch(grievances_by_type);
view_grievance_by_id = trycatch(view_grievance_by_id);
// closed_grievances = trycatch(closed_grievances);
// rejected_grievances = trycatch(rejected_grievances);

module.exports = {
  addGrievance,
  check_api,
  show_all_grievances,
  grievances_by_type,
  view_grievance_by_id,
};
