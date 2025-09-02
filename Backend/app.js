const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const cors = require("cors");

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const doctorRouter = require("./routes/doctor");
const hitsRouter = require("./routes/hits");
const realtimeRouter = require("./routes/realtime");
const patientRouter = require("./routes/patient");

const dotenv = require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const MONGODB_HOST = process.env.MONGODB_HOST || "localhost";

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${MONGODB_HOST}:27017/tele`, {
  useFindAndModify: false,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  serverSelectionTimeoutMS: 30000
});

mongoose.connection
  .once("open", () => {
    console.log("Mongoose Connected!");
  })
  .on("error", (err) => console.error(err));

const app = express();

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    name: "sid",
    saveUninitialized: false,
    resave: false,
    secret: "admin",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      sameSite: true,
      secure: false,
    },
  })
);
app.use(logger("dev"));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "data")));
app.use("/aa/images", express.static(path.join(__dirname, "public/images")));

app.use("/api", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/hits", hitsRouter);
app.use("/api/realtime", realtimeRouter);
app.use("/api", patientRouter);
app.use("/", indexRouter);

module.exports = app;

// "dev": "NODE_ENV = 'development' nodemon ./bin/www"
