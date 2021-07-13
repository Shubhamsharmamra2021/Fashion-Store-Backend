
//shubham

const mongoose =require("mongoose");
const messageSchema =new mongoose.Schema({
    chatroom:{
        type: mongoose.Schema.Types.ObjectID,
        required : 'chatroom is required !',
        ref: "Chatroom",
    },
    product:{
        type: mongoose.Schema.Types.ObjectID,
        required : 'Product is required !',
        ref: "Product",
    },
    user:{
        type: mongoose.Schema.Types.ObjectID,
        required : 'user is required !',
        ref: "User",
    },
    shop:{
        type: mongoose.Schema.Types.ObjectID,
        required : 'Shop is required !',
        ref: "Shop",
    },
    message:{
        type: String,
        required : "Message is required !"
    },
    sendAt: {
        type: Date,
        default: Date.now,
      },
    
});

module.exports = mongoose.model("Message", messageSchema);