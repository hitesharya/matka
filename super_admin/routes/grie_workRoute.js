const express = require('express');
const admin_token_val = require('../middleware/adminTokenVal');
const { get_grievances, get_projects, reject_grievance, reject_project, complete_project, close_grievance, award_project, progress_grievance } = require('../controllers/grie_workCont');
const grie_work_Route = express.Router();




grie_work_Route.route('/get/grievances').post(admin_token_val,get_grievances);
grie_work_Route.route('/get/projects').post(admin_token_val,get_projects);
grie_work_Route.route('/reject/grievance').put(admin_token_val,reject_grievance);
grie_work_Route.route('/reject/project').put(admin_token_val,reject_project);
grie_work_Route.route('/award/project').put(admin_token_val,award_project);
grie_work_Route.route('/complete/project').put(admin_token_val,complete_project);
grie_work_Route.route('/close/grievance').put(admin_token_val,close_grievance);
grie_work_Route.route('/progress/grievance').put(admin_token_val,progress_grievance);





module.exports = grie_work_Route;