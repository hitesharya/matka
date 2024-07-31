const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const adminRoute = require('./super_admin/routes/adminRoute');
const userRoute = require('./users/routes/userRoute');
const path = require('path');

const usersRoute = require('./super_admin/routes/usersRoute');
const grievanceRoute = require('./users/routes/grievanceRoute');
const districtRoute = require('./super_admin/routes/districtRoute');
const villageRoute = require('./super_admin/routes/villageRoute');
const blockRoute = require('./super_admin/routes/blockRoute');
const projectRoute = require('./users/routes/projectRoute');
const areasRoute = require('./users/routes/areasRoute');
const dashboardRoute = require('./super_admin/routes/dashboardRoute');
require('dotenv').config();



app.use(cors());
const rateLimit = require('express-rate-limit');
const grie_work_Route = require('./super_admin/routes/grie_workRoute');
const adminRoute_ = require('./admin/routes/admin_route');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  app.set('trust proxy', 1);
  
 // app.set('view engine', 'ejs');
 // app.set('views', path.join(__dirname, 'public', 'views'));
  app.use(express.json({ limit: '5mb' }));
  
  
  
  
  
  app.use(express.json());
  app.use('/', express.static(path.join(__dirname, 'public')));

// Set up body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 
//routes for super_admin
app.use(adminRoute);
app.use(usersRoute);
app.use(districtRoute);
app.use(villageRoute);
app.use(blockRoute);
app.use(dashboardRoute);
app.use(grie_work_Route)

//route for users
app.use(userRoute);
app.use(grievanceRoute);
app.use(projectRoute);
app.use(areasRoute);


//route for admin
app.use(adminRoute_);


app.get("/check",(req,res)=>res.send({msg:"Super Admin is working"}))


app.listen(process.env.port,()=>{
    console.log(`server is running on port ${process.env.port}`);
})