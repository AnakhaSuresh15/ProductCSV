const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./mongoDB/connect");
const cookieParser = require('cookie-parser');
const userRouter = require("./routes/user.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const bodyParser = require('body-parser');
const {authCheck} = require("./utils/Token");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:1234',
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true
}));

app.use( '/user', userRouter);
app.use( '/dashboard', dashboardRouter);

app.post("/", authCheck); 

const startServer = async () => {
    try {
      connectDB(process.env.MONGODB_URL);
      app.listen(process.env.PORT, () => {
        console.log("Server is running")
        });
    } catch(error) {
      console.log(error);
    }
}
startServer();
  
