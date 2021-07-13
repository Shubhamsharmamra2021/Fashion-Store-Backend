const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add Title"],
  },

  description: {
    type: String,
    required: [true, "Please add Description"],
  },

  stocks: {
    type: String,
    required: [true, "Please add Description"],
  },

  price: {
    type: Number,
    required: [true, "Please add Price"],
  },
  likes : [
    {
      user : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
      }
    }
  ],
  photo: {
    type: Array,
    default: "no-photo.jpg",
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
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
});

ProductSchema.statics.getAverageCost = async function(shopId) {
    console.log('Calculating avg cost...');

    const obj = await this.aggregate([
        {
            $match : { shop : shopId }
        },
        {
            $group: {
                _id : '$shop',
                averageCost: { $avg: '$price' }
            }
        }
    ])

    try{
        await this.model('Shop').findByIdAndUpdate(shopId, {
            averageCost : Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (err) {
        console.log(err)
    }
}

// call getAverageCost after save
ProductSchema.post('save', function() {
    this.constructor.getAverageCost(this.shop);
})

// call getAverageCost before remove
ProductSchema.post('remove', function() {
    this.constructor.getAverageCost(this.shop);
})

 


module.exports = mongoose.model('Product', ProductSchema);