var express = require("express");
var router = express.Router();

var AuthController = require("../controllers/Auth");
var AuthMiddleWare = require("../middleware");

router.post("/signUp", AuthController.signUp);
router.post("/signIn", AuthController.signIn);
router.get("/getMe", AuthMiddleWare, AuthController.getMe);

module.exports = router;
