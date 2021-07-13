
//shubham
const mongoose = require('mongoose');
 
const SaleSchema = new mongoose.Schema({
  
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
   
  sales: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  

  verifyAt: {
    type: Date,
    default: Date.now,
  },


});
 


module.exports = mongoose.model('Sale', SaleSchema);