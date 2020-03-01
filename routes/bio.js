const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticator = require("../middleware/authenticator");
const { check, validationResult } = require("express-validator");

router.get("/", authenticator, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).send("Not authorized!");
    }
    const bio = user.bio;
    res.json({ bio });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/",
  [
    authenticator,
    check("about", "Field shouldn't be empty")
      .optional({ checkFalse: true })
      .not().isEmpty(),
    check("dateOfBirth", "Please include a valid date")
      .optional({ checkFalse: true }).isISO8601()
      .not().isEmpty(),
    check("website", "Please include a valid URL")
      .optional({ checkFalse: true })
      .isURL()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { about, dateOfBirth, website } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).send("Not authorized!");
      }
      const { about, dateOfBirth, website } = req.body;
      if (about) {
        await user.changeAbout(about);
      }
      if (dateOfBirth) {
        await user.changeDateOfBirth(dateOfBirth);
      }
      if (website) {
        await user.changeWebsite(website);
      }
      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:resource", authenticator, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).send("Not authorized!");
    }
    switch (req.params.resource) {
      case "about":
        res.status(200).send(await user.removeAbout());
      case "dateOfBirth":
        res.status(200).send(await user.removeDateOfBirth());
      case "website":
        res.status(200).send(await user.removeWebsite());
      default:
        next();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
