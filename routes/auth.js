const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const { login, getUser } = require("../controllers/auth");

/*
 * @desc Gets logged in user
 * @method GET
 * @api private
*/
router.get("/", authenticator, getUser);

/*
 * @desc Logs in a user
 * @method POST
 * @api public
*/
router.post("/", login);

module.exports = router;
