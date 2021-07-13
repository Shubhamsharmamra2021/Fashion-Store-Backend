const mongoose = require('mongoose');

const SubscriptionSchema = mongoose.Schema({
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    price : {
        type : Number
    },
    startDate: {
        type : Date,
        default: Date.now,
    },
    expireDate : Date,

    subscriptionType : {
        type : String
    }
})

module.exports = mongoose.model('Subscription', SubscriptionSchema);