var mongoose = require("mongoose");

var VideosSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  url: {
    type: String,
    required: [true, "Url is required!"],
  },
  videoId: {
    type: String,
    required: [true, "VideoId is required!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
    default: [],
  },
  unLikes: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Videos", VideosSchema);
