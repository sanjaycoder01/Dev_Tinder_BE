const express = require("express");
const profileRouter = express.Router();
const { userauth } = require("../middlewares/adminauth");
const User = require("../models/user");
profileRouter.get("/profile", userauth, async (req, res) => {
    try {
      const user = req.user;
      res.send(user);
    } catch (error) {
      console.error("Error retrieving profile:", error);
      res.status(400).send(error.message);
    }
  });

module.exports = profileRouter;