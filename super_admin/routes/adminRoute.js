const express = require('express');
const { admin_register, admin_login, admin_logout } = require('../controllers/adminController');
const admin_token_val = require('../middleware/adminTokenVal');
const adminRoute = express.Router();




adminRoute.route('/admin/register').post(admin_register);
adminRoute.route('/admin/login').post(admin_login);
adminRoute.route('/admin/logout').put(admin_token_val,admin_logout);





module.exports = adminRoute;