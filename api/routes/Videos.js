const express = require("express");
const router = express.Router();

const AuthMiddleWare = require("../middleware");
const VideoController = require("../controllers/Videos");

router.get("/", VideoController.getVideos);
router.post("/", AuthMiddleWare, VideoController.postVideo);
router.put("/:videoId", AuthMiddleWare, VideoController.updateLikeOrDisLike);

module.exports = router;
