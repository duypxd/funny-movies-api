var express = require("express");
var router = express.Router();

var UserController = require("../controllers/Auth");

router.post("/signUp", UserController.signUp);
router.post("/signIn", UserController.signIn);

module.exports = router;
