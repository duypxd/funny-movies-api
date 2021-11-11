var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var User = require("../models/User");

const getObjectUser = (resp) => ({
  _id: resp?.id,
  email: resp.email,
  createdAt: resp?.createdAt,
  fullName: resp.fullName,
});

exports.signUp = async (req, res) => {
  try {
    const response = await User.find({ email: req.body.email }).exec();
    if (response.length > 0) {
      return res.status(422).send({
        status: false,
        message: "This account already exists.",
      });
    } else {
      bcrypt.hash(req.body.password, 10, (__, hash) => {
        const newUser = {
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          fullName: req.body.fullName || "",
          createdAt: Date.now(),
        };
        var token = jwt.sign(
          { _id: newUser._id, email: newUser.email },
          process.env.JWT_KEY,
          { expiresIn: "168h" }
        );
        const userRequest = new User({
          ...newUser,
          password: hash,
        });
        userRequest
          .save()
          .then(() => {
            res.status(200).send({
              status: true,
              user: {
                ...newUser,
                token,
              },
              message: "Resister successfully!",
            });
          })
          .catch(() => {
            res.status(400).send({
              status: false,
              message: "Resister failed!",
            });
          });
      });
    }
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "An unexpected error occurred.",
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    const response = await User.findOne({ email: req.body.email }).exec();
    bcrypt.compare(req.body.password, response.password, (error, results) => {
      if (error) {
        return res.status(400).send({
          status: true,
          message: "Password incorrect!",
        });
      } else if (results) {
        var token = jwt.sign(
          {
            email: response.email,
            _id: response._id,
          },
          process.env.JWT_KEY,
          { expiresIn: "168h" }
        );
        return res.status(200).send({
          status: true,
          message: "Login successfully!",
          user: {
            ...getObjectUser(response),
            token,
          },
        });
      } else {
        return res.status(422).send({
          status: true,
          message: "Login failed. User does not exist!",
        });
      }
    });
  } catch (err) {
    return res.status(400).send({
      status: false,
      message: "Login failed. User does not exist!",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.userData._id }).exec();
    res.status(200).send({
      status: true,
      user: getObjectUser(user),
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "User not found.",
    });
  }
};
