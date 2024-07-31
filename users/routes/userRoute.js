const express = require('express');
const { registration, userLogin, userLogout, delete_user } = require('../controllers/userController');
const { user_token_val } = require('../middleware/user_token_val');
const userRoute = express.Router();


userRoute.route('/citizen/signup').post(registration)
userRoute.route('/user/login').post(userLogin)
userRoute.route('/user/logout').post(user_token_val,userLogout)
userRoute.route('/delete/user').delete(delete_user)




module.exports = userRoute