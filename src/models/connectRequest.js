const mongoose = require('mongoose');

const connectRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum:{
            values: ['ignore', 'interested', 'accepted', 'rejected'],
            message: '{VALUE} is not a valid status',
        },
        required: true,
    },
}, { timestamps: true });
// compound index for fromUserId and toUserId
connectRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const ConnectRequest = mongoose.model('ConnectRequest', connectRequestSchema);

module.exports = ConnectRequest;