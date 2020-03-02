const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  commentedOn: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
    required: true
  },
  onModel: {
    type: String,
    required: true,
    enum: ["posts", "comments"]
  },
  edited: {
    type: Boolean,
    default: false
  },
  postContent: {
    text: {
      type: String,
      minlength: 1,
      maxlength: 280
    },
    media: {
      mediaLink: {
        type: String
      },
      typeOfMedia: {
        type: String
      }
    }
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  retweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  quotedReplies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts"
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments"
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
  tweetType: {
    type: String,
    default: "comments"
  }
});

module.exports = mongoose.model("comments", CommentSchema);
