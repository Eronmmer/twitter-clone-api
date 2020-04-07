const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const { getBio, editBio } = require("../controllers/bio");

/*
 * @desc Get bio of the current user
 * @method GET
 * @api private
 */
router.get("/", authenticator, getBio);

/*
 * @desc Edit the current user bio
 * @method PUT
 * @api private
 */
router.put("/", authenticator, editBio);

module.exports = router;
