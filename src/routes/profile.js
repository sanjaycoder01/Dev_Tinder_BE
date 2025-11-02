const express = require("express");
const profileRouter = express.Router();
const { userauth } = require("../middlewares/adminauth");
const User = require("../models/user");
const { validateProfileUpdateData } = require("../utils/validation");
profileRouter.get("/profile/view", userauth, async (req, res) => {
    try {
      const user = req.user;
      res.send(user);
    } catch (error) {
      console.error("Error retrieving profile:", error);
      res.status(400).send(error.message);
    }
  });
profileRouter.patch("/profile/edit", userauth, async (req, res) => {
  try {
    if(!validateProfileUpdateData(req)){
      throw new Error("Invalid update fields");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(field=>{
      loggedInUser[field]=req.body[field];
    });
    await loggedInUser.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: loggedInUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).send(error.message);
  }
});
module.exports = profileRouter;