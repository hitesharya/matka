const express = require('express');
const admin_token_val = require('../middleware/adminTokenVal');
const { add_block } = require('../controllers/blockCont');
const blockRoute = express.Router();





blockRoute.route('/add/block').post(admin_token_val,add_block);





module.exports = blockRoute;