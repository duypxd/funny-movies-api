var express = require("express");
var app = express();
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
require("dotenv").config();

//routes
var AuthRouter = require("./api/routes/Auth");

//connect DB;
mongoose.connect(process.env.DATABASE_ACCOUNT_CONNECT, {
  useNewUrlParser: true,
});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/api/auth", AuthRouter);

app.use((_, __, next) => {
  const err = new Error("NotFound");
  err.status = 404;
  next(err);
});

app.use((err, _, res, __) => {
  res.status(err?.status || 500);
  res.json({
    message: "Internal server error!",
  });
});

module.exports = app;
