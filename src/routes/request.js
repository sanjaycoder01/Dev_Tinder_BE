const express = require("express");
const requestRouter = express.Router();
const { userauth } = require("../middlewares/adminauth");
const User = require("../models/user");
const ConnectRequest = require("../models/connectRequest");
requestRouter.post("/request/send/:status/:toUserId", userauth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const allowedStatus=['ignore','interested'];
    const status = req.params.status;
    if(!allowedStatus.includes(status)){
      return res.status(400).json({
        success: false,
        message: "Invalid status: status must be 'ignored' or 'interested'",
      });
    }
    //check if the request is already sent
    const existingRequest = await ConnectRequest.findOne({ fromUserId, toUserId });
    if(existingRequest){
      return res.status(400).json({
        success: false,
        message: "Request already sent by you to this user",
      });
    }
    //check if the toUser is the same as the fromUser
    if(toUserId === fromUserId){
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }
    //check if toUser is already sent a request to fromUser orfromUser is already sent a request to toUser
    const existingRequestToUser = await ConnectRequest.findOne({ $or: [{ fromUserId: toUserId, toUserId: fromUserId }, { fromUserId: fromUserId, toUserId: toUserId }] });
    if(existingRequestToUser){
      return res.status(400).json({
        success: false,
        message: "User has already sent a request to you!",
      });
    }
    //check if the touserid is is in our db or not
    const toUser = await User.findById(toUserId);
    if(!toUser){ 
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const newRequest = new ConnectRequest(
      {
        fromUserId,
        toUserId,
        status,
      },
    );
    await newRequest.save();
    res.status(201).json({
      success: true,
      message: `${req.user.name} has sent you a request to connect with you,"${status}"`,
      data: newRequest,
    });
  } 
  catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = requestRouter;