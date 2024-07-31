const express = require('express');
const admin_token_val = require('../middleware/adminTokenVal');
const { dashboard, add_category, add_sub_cat } = require('../controllers/dashboardCont');
const dashboardRoute = express.Router();





dashboardRoute.route('/admin/dashboard').get(admin_token_val,dashboard);
dashboardRoute.route('/add/category').post(admin_token_val,add_category);
dashboardRoute.route('/add/sub/category').post(admin_token_val,add_sub_cat);






module.exports = dashboardRoute;