const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  edited: {
    type: Boolean,
    default: false
  },
  postContent: {
    text: {
      type: String,
      required: true,
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
    },
    required: true
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
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      },
      postContent: {
        text: {
          type: String,
          required: true,
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
        },
        required: true
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
      ]
    }
  ]
});

const PostModel = mongoose.model("posts", PostSchema);
module.exports = PostModel;
