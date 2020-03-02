const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticator = require("../middleware/authenticator");

/*
there will be 
- follow users, unfollow
- block user(. once you block, once you block you unfollow but not the otherway round), unblock
- mute user, unmute
- turn on post notifications(you must be following and not blocked), turn off
 */

// follow
router.put("/follow/:userId", authenticator, async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const follower = await User.findById(req.user.id);
    if (!userToFollow) {
      return res.status(404).send("This user does not exist");
    }

    // make sure user doesn't follow himself
    if (req.params.userId === req.user.id) {
      return res.status(400).send("Sorry fella, you can't follow thyself...");
    }

    // check if user is already following
    if (
      userToFollow.followers.filter(user => user.toString() === req.user.id)
        .length === 1
    ) {
      return res.status(400).send("You're already following this user!");
    }

    userToFollow.followers.unshift(req.user.id);
    follower.following.unshift({ user: req.params.userId });
    await userToFollow.save();
    await follower.save();
    res.json({ msg: "Successfully followed", follower, userToFollow });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// unfollow
router.put("/unfollow/:userId", authenticator, async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const follower = await User.findById(req.user.id);
    if (!userToUnfollow) {
      return res.status(404).send("This user does not exist");
    }

    // make sure user doesn't unfollow theirself
    if (req.params.userId === req.user.id) {
      return res.status(400).send("Sorry fella, you can't unfollow thyself...");
    }

    // check if user is not following
    if (
      userToUnfollow.followers.filter(user => user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).send("You're not following this user fella...");
    }

    userToUnfollowIndex = userToUnfollow.followers.findIndex(
      e => e.toString() === req.user.id
    );
    userToUnfollow.followers.splice(userToUnfollowIndex, 1);

    followerIndex = follower.following.findIndex(
      e => e.user.toString() === req.params.userId
    );
    follower.following.splice(followerIndex, 1);
    await userToUnfollow.save();
    await follower.save();
    res.json({ msg: "Successfully unfollowed", follower, userToUnfollow });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// block a user
router.put("/block/:userId", authenticator, async (req, res, next) => {
  try {
    const userToBlock = await User.findById(req.params.userId);
    const user = await User.findById(req.user.id);
    if (!userToBlock) {
      return res.status(404).send("This user does not exist");
    }

    // make sure they can't block themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).send("Sorry fella, you can't block thyself...");
    }

    // check if they've already been blocked
    if (
      user.blocked.filter(e => e.toString() === req.params.userId).length === 1
    ) {
      return res.status(400).send("You've already blocked this guy fella...");
    }

    user.blocked.unshift(req.params.userId);
    user.save();
    res.json({ msg: "successfully blocked", blocked: user.blocked });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// unblock a user
router.put("/unblock/:userId", authenticator, async (req, res, next) => {
  try {
    const userToUnblock = await User.findById(req.params.userId);
    const user = await User.findById(req.user.id);
    if (!userToUnblock) {
      return res.status(404).send("This user does not exist");
    }

    // make sure they can't unblock themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).send("Sorry fella, you can't unblock thyself...");
    }

    // check if they're trying to unblock who they haven't blocked
    if (
      user.blocked.filter(e => e.toString() === req.params.userId).length === 0
    ) {
      return res
        .status(400)
        .send("You can't unblock who you haven't blocked...");
    }

    const blockedIndex = user.blocked.findIndex(
      e => e.toString() === req.params.userId
    );
    user.blocked.splice(blockedIndex, 1);
    user.save();
    res.json({ msg: "successfully unblocked", blocked: user.blocked });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// mute a user
router.put("/mute/:userId", authenticator, async (req, res, next) => {
  try {
    const userToMute = await User.findById(req.params.userId);
    const user = await User.findById(req.user.id);
    if (!userToMute) {
      return res.status(404).send("This user does not exist");
    }

    // make sure they can't mute themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).send("Sorry fella, you can't mute thyself...");
    }

    // check if they've already been muted
    if (
      user.muted.filter(e => e.toString() === req.params.userId).length === 1
    ) {
      return res.status(400).send("You've already muted this guy fella...");
    }

    user.muted.unshift(req.params.userId);
    user.save();
    res.json({ msg: "successfully muted", muted: user.muted });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// unmute a user
router.put("/unmute/:userId", authenticator, async (req, res, next) => {
  try {
    const userToUnmute = await User.findById(req.params.userId);
    const user = await User.findById(req.user.id);
    if (!userToUnmute) {
      return res.status(404).send("This user does not exist");
    }

    // make sure they can't unmute themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).send("Sorry fella, you can't unmute thyself...");
    }

    // check if they're trying to unmute who they haven't muted
    if (
      user.muted.filter(e => e.toString() === req.params.userId).length === 0
    ) {
      return res.status(400).send("You can't unmute who you haven't muted...");
    }

    const mutedIndex = user.muted.findIndex(
      e => e.toString() === req.params.userId
    );
    user.muted.splice(mutedIndex, 1);
    user.save();
    res.json({ msg: "successfully unmuted", muted: user.muted });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

// turn on notifications for a user
router.put(
  "/notificationsOn/:userId",
  authenticator,
  async (req, res, next) => {
    try {
      const following = await User.findById(req.params.userId);
      const user = await User.findById(req.user.id);

      if (!following) {
        return res.status(404).send("This user does not exist!");
      }

      // verify that user isn't turning on notifications for themselves.
      if (req.user.id === req.params.userId) {
        return res
          .status(400)
          .send(
            "Sorry fella, you can't turn on post notifications for thyself..."
          );
      }

      // verify that user is following who they wanna turn on notifs for
      if (
        user.following.filter(e => e.user.toString() === req.params.userId)
          .length === 0
      ) {
        return res
          .status(400)
          .send(
            "You can't turn on notifications for who you aren't following..."
          );
      } else {
        user.following.forEach(e => {
          if (e.user.toString() === req.params.userId) {
            e.notificationsOn = true;
          }
        });

        await user.save();
        res.json({
          msg: "Successfully turned notifications on",
          following: user.following.filter(
            e => e.user.toString() === req.params.userId
          )
        });
      }
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send("This user does not exist");
      }
      next(err);
    }
  }
);

// turn off notifications
router.put("/notificationsOff/:userId", authenticator, async (req, res, next) => {
  try {
    const following = await User.findById(req.params.userId);
    const user = await User.findById(req.user.id);

    if (!following) {
      return res.status(404).send("This user does not exist!");
    }

    // verify that user isn't turning off notifications for themselves.
    if (req.user.id === req.params.userId) {
      return res
        .status(400)
        .send(
          "Sorry fella, you can't turn off post notifications for thyself..."
        );
    }

    if (
        user.following.filter(e => e.user.toString() === req.params.userId)
          .length === 0
    ) {
      return res.status(400).send("You can't turn off notifs for who you aren't following.")
    }
    
     user.following.forEach(e => {
       if (e.user.toString() === req.params.userId) {
         e.notificationsOn = false;
       }
     });

     await user.save();
     res.json({
       msg: "Successfully turned notifications off",
       following: user.following.filter(
         e => e.user.toString() === req.params.userId
       )
     });


  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This user does not exist");
    }
    next(err);
  }
});

module.exports = router;
