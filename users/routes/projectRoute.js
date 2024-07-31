const express = require('express');
const uploadProject = require('../../utils/projectImg');
const { addProject, show_no_of_project, show_all_projects, projects_by_type, view_projects_by_id, update_project, editProject } = require('../controllers/projectCont');
const { official_token_val, user_token_val } = require('../middleware/user_token_val');
const projectRoute = express.Router();




projectRoute.route('/add/project').post(official_token_val,uploadProject.array('images', 4),addProject)
projectRoute.route('/show/number/project').post(official_token_val,show_no_of_project)
projectRoute.route('/show/all/project').post(official_token_val,show_all_projects)
projectRoute.route('/show/project/by/type').post(user_token_val,projects_by_type)
projectRoute.route('/view/project/by/id').post(user_token_val,view_projects_by_id)
projectRoute.route('/update/project').put(official_token_val,uploadProject.single("image"),update_project)
projectRoute.route('/edit/project').put(official_token_val,uploadProject.array('images', 3),editProject)



module.exports = projectRoute