const express = require('express');
const admin_token_val = require('../middleware/adminTokenVal');
const { add_village, get_villages } = require('../controllers/villageCont');
const villageRoute = express.Router();





villageRoute.route('/add/village').post(admin_token_val,add_village);
villageRoute.route('/get/villages').post(admin_token_val,get_villages);





module.exports = villageRoute;