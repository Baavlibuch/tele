const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");

const dotenv = require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const MONGODB_HOST = process.env.MONGODB_HOST || "mongo";

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "data")));
app.use("/aa/images", express.static(path.join(__dirname, "public/images")));

app.use("/api", indexRouter);
app.use("/admin", adminRouter);

module.exports = app;

// "dev": "NODE_ENV = 'development' nodemon ./bin/www"
