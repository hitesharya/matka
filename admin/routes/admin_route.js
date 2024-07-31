const express = require('express');
const { admin2_register, admin2_login, admin2_logout, get_gries, view_gries_by_id } = require('../controller/admin2Cont');
const admin2_token_val = require('../middleware/adminToken');
const adminRoute_ = express.Router();




adminRoute_.route('/admin/two/register').post(admin2_register);
adminRoute_.route('/admin/two/login').post(admin2_login);
adminRoute_.route('/admin/two/logout').put(admin2_token_val,admin2_logout);
adminRoute_.route('/admin/get/grievances').get(admin2_token_val,get_gries);
adminRoute_.route('/admin/view/grievances').get(admin2_token_val,view_gries_by_id);





module.exports = adminRoute_;