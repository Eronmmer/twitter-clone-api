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
	quotedReply: {
		type: Boolean,
		default: false
	},
	replyQuoted: {
		type: mongoose.Schema.Types.ObjectId,
		refPath: "onModelQuoted"
	},
	onModelQuoted: {
		type: String,
		enum: ["posts", "comments"]
	},
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
		default: "posts"
	}
});

const PostModel = mongoose.model("posts", PostSchema);
module.exports = PostModel;
