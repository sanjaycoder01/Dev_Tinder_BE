const express = require("express");
const { userauth } = require("../middlewares/adminauth");
const ConnectRequest = require("../models/connectRequest");
const userRouter = express.Router();
userRouter.get("/user/requests/received", userauth, async (req, res) => {
    try{
        //usermust be loggedin user
        const loggedInUserId = req.user;
        const requests=await ConnectRequest.find({toUserId:loggedInUserId._id,status:"interested"}).populate("fromUserId","name age gender location skills about");
        res.status(200).json({
            success: true,
            message: "Requests fetched successfully",
            data: requests
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
userRouter.get("/user/requests/sent", userauth, async (req, res) => {
    try{
        const loggedInUserId = req.user;
        const requests=await ConnectRequest.find(
            {
                $or:[
                    {fromUserId:loggedInUserId._id,status:"accepted"},
                    {toUserId:loggedInUserId._id,status:"accepted"}
                ]
            }
        ).populate("fromUserId","name age gender location skills about");
       const data=requests.map((request)=>request.fromUserId);
        console.log(requests);
        res.status(200).json({
            success: true,
            message: "Requests sent fetched successfully",
            data: data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
module.exports=userRouter;