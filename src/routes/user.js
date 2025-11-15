const express = require("express");
const mongoose = require("mongoose");
const { userauth } = require("../middlewares/adminauth");
const ConnectRequest = require("../models/connectRequest");
const User = require("../models/user");
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
userRouter.get('/feed',userauth,async(req,res)=>{
    try{
        // donot show the users who have already sent a request to the logged in user
        //dont show the users who have already accepted a request from the logged in user
        //dont show the users who have already rejected a request from the logged in user
        //dont show the users who have already ignored a request from the logged in user
        // dont show the logged in user in the feed
        
        const loggedInUser = req.user;
        
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Validate pagination parameters
        if (page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page number must be greater than 0"
            });
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }
        
        // Find all connection requests where the logged in user is involved (either as sender or receiver)
        const connections = await ConnectRequest.find({
            $or:[
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");
        
        // Extract all user IDs that should be excluded from the feed
        const excludedUserIds = new Set();
        excludedUserIds.add(loggedInUser._id.toString()); // Exclude the logged in user
        
        connections.forEach(connection => {
            // Add both users from each connection (one will be the logged in user, but that's okay)
            excludedUserIds.add(connection.fromUserId.toString());
            excludedUserIds.add(connection.toUserId.toString());
        });
        
        // Convert Set to Array and back to ObjectIds for MongoDB query
        const excludedIdsArray = Array.from(excludedUserIds).map(id => new mongoose.Types.ObjectId(id));
        
        // Build query for feed users
        const query = {
            _id: { $nin: excludedIdsArray }
        };
        
        // Get total count for pagination metadata
        const totalUsers = await User.countDocuments(query);
        
        // Find all users except the excluded ones with pagination
        const feedUsers = await User.find(query)
            .select("name age gender location skills about")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
            success: true,
            message: "Feed fetched successfully",
            data: feedUsers,

        });
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
module.exports=userRouter;