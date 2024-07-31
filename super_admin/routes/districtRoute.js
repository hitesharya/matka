const express = require('express');
const admin_token_val = require('../middleware/adminTokenVal');
const { add_district } = require('../controllers/districtContr');
const districtRoute = express.Router();





districtRoute.route('/add/district').post(admin_token_val,add_district);





module.exports = districtRoute;