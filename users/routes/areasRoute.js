const express = require('express');
const { get_villages_by_blockId, get_blocks, get_category, get_sub_category } = require('../controllers/areasCont');
const areasRoute = express.Router();





areasRoute.route('/get/villagesby/block').post(get_villages_by_blockId);
areasRoute.route('/get/blocks').post(get_blocks);
areasRoute.route('/get/category').post(get_category);
areasRoute.route('/get/sub/category').post(get_sub_category);





module.exports = areasRoute;