const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Videos = require("../models/Videos");

exports.getVideos = async (req, res) => {
  try {
    const userId = req?.headers?.authorization
      ? jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_KEY)
          ?._id
      : undefined;
    const data = await Videos.find();
    res.status(200).send({
      status: true,
      total: data?.length,
      data: data?.map((m) => ({
        _id: m?._id,
        url: m?.url,
        authorShare: m?.authorShare,
        videoId: m?.videoId,
        isLike: userId ? m.likes?.some((s) => userId === s) : false,
        isUnLikes: userId ? m.unLikes?.some((s) => userId === s) : false,
        createdAt: m?.createdAt,
        title: m?.title,
        desc: m?.desc,
        updatedAt: m?.updatedAt,
        likes: m?.likes?.length || 0,
        unLikes: m?.unLikes?.length || 0,
      })),
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal server error!",
      err,
    });
  }
};

exports.postVideo = async (req, res) => {
  try {
    const video = new Videos({
      _id: new mongoose.Types.ObjectId(),
      url: req.body.url,
      authorShare: req.body.authorShare,
      videoId: req.body.videoId,
      title: req.body.title,
      desc: req.body.desc,
      createdAt: Date.now(),
    });
    const result = await video.save();
    res.status(200).send({
      status: true,
      result,
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal server error!",
      err,
    });
  }
};

exports.updateLikeOrDisLike = async (req, res) => {
  try {
    const findVideo = await Videos.findById({ _id: req.params.videoId }).exec();
    const userId = req.userData._id;

    const updateRequest = {
      likes: req.body.isVote
        ? findVideo.likes?.some((s) => userId === s)
          ? findVideo.likes
          : [...findVideo.likes, userId]
        : findVideo.likes.filter((f) => f !== userId),
      unLikes: !req.body.isVote
        ? findVideo.unLikes?.some((s) => userId === s)
          ? findVideo.unLikes
          : [...findVideo.unLikes, userId]
        : findVideo.unLikes.filter((f) => f !== userId),
      updatedAt: Date.now(),
    };
    await Videos.updateOne(
      { _id: req.params.videoId },
      { $set: updateRequest }
    ).exec();
    res.status(200).send({
      status: true,
      result: {
        _id: findVideo?._id,
        url: findVideo?._url,
        authorShare: findVideo.authorShare,
        videoId: findVideo?.videoId,
        createdAt: findVideo?.createdAt,
        title: findVideo.title,
        desc: findVideo.odesc,
        updatedAt: findVideo?.updatedAt,
        ...updateRequest,
        likes: updateRequest.likes.length || 0,
        unLikes: updateRequest.likes.length || 0,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
