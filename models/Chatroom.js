
//shubham
const mongoose = require('mongoose');
 
const ChatroomSchema = new mongoose.Schema({
 
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
 
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

  createdAt: {
    type: Date,
    default: Date.now,
  },


});
 
// Cascade delete products when a shop is deleted
ChatroomSchema.pre('remove', async function(next) {
  await this.model('Chatroom').deleteMany({ product : this._id })
  next();
})



module.exports = mongoose.model('Chatroom', ChatroomSchema);