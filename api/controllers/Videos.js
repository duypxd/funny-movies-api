const mongoose = require("mongoose");

const Videos = require("../models/Videos");
const User = require("../models/User");

exports.getVideos = async (req, res) => {
  try {
    const data = await Videos.find();
    res.status(200).send({
      status: true,
      total: data?.length,
      data: data?.map((m) => ({
        _id: m?._id,
        url: m?.url,
        videoId: m?.videoId,
        createdAt: m?.createdAt,
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
      videoId: req.body.videoId,
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
    const user = await User.findById({ _id: req.userData._id }).exec();
    const userId = user?._id?.toHexString();

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
        videoId: findVideo?.videoId,
        createdAt: findVideo?.createdAt,
        updatedAt: findVideo?.updatedAt,
        ...updateRequest,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
