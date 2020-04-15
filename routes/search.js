const express = require("express");
const router = express.Router();
const { search } = require("../controllers/search");

/*
 * @desc Search for tweets or users based on queries passed
 * @method GET
 * @api public
 */

router.get("/:match", search);

module.exports = router;
