const express = require('express');
const { addGrievance, check_api, show_all_grievances, grievances_by_type, view_grievance_by_id} = require('../controllers/grievanceCont');
const upload = require('../../utils/imgandjpg');
const { citizen_token_val, user_token_val } = require('../middleware/user_token_val');
const grievanceRoute = express.Router();




grievanceRoute.route('/add/grievance').post(citizen_token_val,upload.array('images', 4),addGrievance)
grievanceRoute.route('/check/api').post(user_token_val,check_api)
grievanceRoute.route('/show/all/grievance').post(citizen_token_val,show_all_grievances)
grievanceRoute.route('/show/grievance/by/type').post(citizen_token_val,grievances_by_type)
grievanceRoute.route('/view/grievance/by/id').post(citizen_token_val,view_grievance_by_id)
//grievanceRoute.route('/show/closed/grievance').get(citizen_tokenval,closed_grievances)
//grievanceRoute.route('/show/rejected/grievance').get(citizen_tokenval,rejected_grievances)



module.exports = grievanceRoute