const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const router = express.Router();
const { check } = require("express-validator");
const authenticator = require("../middleware/authenticator");
const {
	allTweets,
	allLikes,
	getUserProfile,
	editBio,
	getMyProfile,
	changeName,
	changeUsername,
	changeAvatar,
	changeCoverImage,
	removeAvatar,
	removeCoverImage,
	deleteAccount,
	changePassword,
	getUserById,
} = require("../controllers/users");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
const avatarStorage = cloudinaryStorage({
	cloudinary: cloudinary,
	folder: "media",
	allowedFormats: ["jpg", "png"],
	transformation: [{ width: 400, height: 400, crop: "limit" }],
});
const coverStorage = cloudinaryStorage({
	cloudinary: cloudinary,
	folder: "media",
	allowedFormats: ["jpg", "png"],
	transformation: [{ width: 600, height: 200, crop: "limit" }],
});

const avatarParser = multer({
	storage: avatarStorage,
	fileFilter: (req, file, cb) => {
		if (
			!file.mimetype.includes("jpeg") &&
			!file.mimetype.includes("jpg") &&
			!file.mimetype.includes("png") &&
			!file.mimetype.includes("pjp") &&
			!file.mimetype.includes("pjpeg") &&
			!file.mimetype.includes("jfif") &&
			!file.mimetype.includes("webp")
		) {
			return cb(new Error("Only images are allowed"));
		}
		cb(undefined, true);
	},
});
const coverParser = multer({
	storage: coverStorage,
	fileFilter: (req, file, cb) => {
		if (
			!file.mimetype.includes("jpeg") &&
			!file.mimetype.includes("jpg") &&
			!file.mimetype.includes("png") &&
			!file.mimetype.includes("pjp") &&
			!file.mimetype.includes("pjpeg") &&
			!file.mimetype.includes("jfif") &&
			!file.mimetype.includes("webp")
		) {
			return cb(new Error("Only images are allowed"));
		}
		cb(undefined, true);
	},
});

/*
 * @desc Get all tweets of a user including retweets.
 * To get all of the users comments or replies too, add
 * an include query with a value of replies. `/allTweets?include=replies`
 * @method GET
 * @api public
 */
router.get("/tweets/:userId", allTweets);

/*
 * @desc Get all likes by a user
 * @method GET
 * @api public
 */
router.get("/likes/:userId", allLikes);

/*
 * @desc Get bio/profile of any user by their username
 * @method GET
 * @api public
 */
router.get("/profile/:username", getUserProfile);


/*
 * @desc Get bio/profile of any user by id
 * @method GET
 * @api public
 */
router.get("/profile-by-id/:userId", getUserById);

/*
 * @desc Get current user's profile
 * @method GET
 * @api private
 */
router.get("/profile", authenticator, getMyProfile);

/*
 * @desc Edit the current user bio
 * @method PUT
 * @api private
 */
router.put("/bio", authenticator, editBio);

/*
 * @desc Change name of current user
 * @method PUT
 * @api private
 */
router.put(
	"/profile-change/name",
	[check("name", "Field shouldn't be empty").not().isEmpty(), authenticator],
	changeName
);

/*
 * @desc Change username of current user
 * @method PUT
 * @api private
 */
router.put("/profile-change/username", authenticator, changeUsername);

/*
 * @desc Change password of current user
 * @method PUT
 * @api private
 */
router.put(
	"/profile-change/password",
	[
		check("oldPassword", "All fields are required").not().isEmpty(),
		check(
			"newPassword",
			"Your password must be at least 8 characters"
		).isLength({ min: 8 }),
		authenticator,
	],
	changePassword
);

/*
 * @desc Change avatar of current user
 * @method POST
 * @api private
 */
router.post(
	"/profile-change/avatar",
	[authenticator, avatarParser.single("profile-image")],
	changeAvatar,
	(err, req, res, next) => {
		if (err.message === "Only images are allowed") {
			return res.status(400).json({
				errors: [
					{
						msg: err.message,
						status: "400",
					},
				],
			});
		} else {
			next(err);
		}
	}
);

/*
 * @desc Change cover Image(banner) of current user
 * @method POST
 * @api private
 */
router.post(
	"/profile-change/cover",
	[authenticator, coverParser.single("cover-image")],
	changeCoverImage,
	(err, req, res, next) => {
		if (err.message === "Only images are allowed") {
			return res.status(400).json({
				errors: [
					{
						msg: err.message,
						status: "400",
					},
				],
			});
		} else {
			next(err);
		}
	}
);

/*
 * @desc Delete avatar/profile-picture of current user
 * @method DELETE
 * @api private
 */
router.delete("/profile-change/avatar", authenticator, removeAvatar);

/*
 * @desc Delete cover Image(banner) of current user
 * @method DELETE
 * @api private
 */
router.delete("/profile-change/cover", authenticator, removeCoverImage);

/*
 * @desc Delete account of current user
 * @method DELETE
 * @api private
 */
router.delete("/account/me", authenticator, deleteAccount);

module.exports = router;
