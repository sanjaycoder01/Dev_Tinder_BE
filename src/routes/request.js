const express = require("express");
const requestRouter = express.Router();
const { userauth } = require("../middlewares/adminauth");
const User = require("../models/user");
requestRouter.post("/sendconnection", userauth, async (req, res) => {
  res.send("connection sent");
});

module.exports = requestRouter;