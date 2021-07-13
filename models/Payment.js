
//shubham
const mongoose = require('mongoose');
 
const PaymentSchema = new mongoose.Schema({
  
  
    paymentDetail: String, 


  addAt: {
    type: Date,
    default: Date.now,
  },


});
 


module.exports = mongoose.model('Payment', PaymentSchema);