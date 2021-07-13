const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const geocoder = require('../utils/geocoder');


const UserSchema = new mongoose.Schema({
  to: {
    type: String,
    required: [true, "Please add number"],
  },

  role: {
    type: String,
    enum: ["user", "vendor", "sales", "admin", "superadmin"],
    default: "user",
  },

  name: {
      type: String,
    },

  email: {
      type: String,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    adhaarNumber: {
      type: Number,
      length: [12, "Addhar no is 12 digit"],
    },

  address: {
      type: String,
      require: [true, "Please add an address"],
    },

  location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        required: false,
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },


  avatar: {
      type: String,
      default: "no-photo.jpg",
    },
    
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};


// Geocode & create location field

UserSchema.pre('save', async function(next) {

  const loc = await geocoder.geocode(this.address);
  this.location = {
      type : 'Point',
      coordinates : [loc[0].longitude, loc[0].latitude],
      formattedAddress : loc[0].formattedAddress,
      street : loc[0].streetName,
      city : loc[0].city,
      state : loc[0].stateCode,
      zipcode : loc[0].zipcode,
      country : loc[0].countryCode,
  }

  // Do not save address in DB
  this.address = undefined;
  next();
})


 


module.exports = mongoose.model("User", UserSchema);
