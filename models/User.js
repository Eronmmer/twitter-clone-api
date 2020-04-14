const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		url: {
			type: String,
			default:
				"https://res.cloudinary.com/twittr/image/upload/v1586895328/media/default_zszxma.png",
		},
		id: {
			type: String,
			default: "media/default_zszxma",
		},
	},
	coverImage: {
		url: {
			type: String,
			default:
				"https://res.cloudinary.com/twittr/image/upload/v1586895816/media/cover_i5waru.jpg",
		},
		id: {
			type: String,
			default: "media/cover_i5waru",
		},
	},
	// resetToken: String,
	// resetTokenExpiration: String,
	bio: {
		about: {
			type: String,
		},
		dateOfBirth: {
			type: Date,
		},
		website: {
			type: String,
		},
		joined: {
			type: Date,
			default: Date.now,
		},
	},
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	],
	following: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "users",
			},
			notificationsOn: {
				type: Boolean,
				default: false,
			},
		},
	],
	blocked: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	],
	blockedMe: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	],
	muted: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	],
	date: {
		type: Date,
		default: Date.now,
	},
});

// method to add date of birth
UserSchema.methods.changeDateOfBirth = function (date) {
	const toDate = new Date(date);
	this.bio.dateOfBirth = toDate.toISOString();

	return this.save();
};

UserSchema.methods.removeDateOfBirth = function () {
	this.bio.dateOfBirth = undefined;
	return this.save();
};

// method to add about
UserSchema.methods.changeAbout = function (about) {
	this.bio.about = about;
	return this.save();
};

UserSchema.methods.removeAbout = function () {
	this.bio.about = undefined;
	return this.save();
};

// method to add website
UserSchema.methods.changeWebsite = function (url) {
	this.bio.website = url;
	return this.save();
};

UserSchema.methods.removeWebsite = function () {
	this.bio.website = undefined;
	return this.save();
};

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
