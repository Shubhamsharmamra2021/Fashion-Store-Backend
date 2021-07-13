const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const Shop = require('../models/Shop');
const User = require("../models/User");
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const auth = require("../middleware/auth");
const { Verify } = require('crypto');

// @dec         Get all Shops
//@route        GET /api/v1/Shops
//@access       Public
exports.getShops = asyncHandler (async (req, res, next) => {

    res.status(200).json(res.advanceResult)
});

// @dec         Get single Shops
//@route        GET /api/v1/Shops/:id
//@access       Public

exports.getSingleShop = asyncHandler (async (req, res, next) => {
    const shop = await Shop.findById(req.params.id) ;

    if(!shop) {
        return next(new ErrorResponce(`shop not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({ success : true, data : shop }) 
})

// @dec         Create new shop
//@route        POST /api/v1/Shops
//@access       Private

exports.createShop = asyncHandler (async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
 

  //Check for Vendor Shop
  const vendorShop = await Shop.findOne({ user: req.user.id });

  // if user is not an admin, they can only add one Shop
  if (vendorShop && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `The user ID ${req.user.id} has already Create a Shop`,
        400 
      )
    ); 
  }

  //Generate pin for shop
  var val = Math.floor(1000 + Math.random() * 9000);
  req.body.verifyPin = val;



  const shop = await Shop.create(req.body);

  res.status(201).json({
    success: true,
    data: shop,
  });
})

// @dec         Update product
//@route        PUT /api/v1/Shops/:id
//@access       Private

exports.updateShop = asyncHandler (async (req, res, next) => {
    let shop = await Shop.findById(req.params.id)
    if(!shop) {
        return next(new ErrorResponce(`Shop not found with this id ${req.params.id}`, 404));
    }


    // Make Sure user is bootcamp owner
    if(shop.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponce(`User ${req.user.id} is not the owner of this Shop`, 404));
    }

    shop = await Shop.findOneAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    })


    res.status(201).json({ success : true, data : shop });  
})

// @dec         Delete product
//@route        DELETE /api/v1/Shops/:id
//@access       Private

exports.deleteShop = asyncHandler (async (req, res, next) => {
        const shop = await Shop.findById(req.params.id)

        if(!shop) {
            return next(new ErrorResponce(`Shop not found with this id ${req.params.id}`, 404));
        }

            // Make Sure user is bootcamp owner
    if(shop.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponce(`User ${req.user.id} is not the owner of this Shop`, 404));
    }
    
        shop.remove(); 

        res.status(200).json({ success : true, message : 'Shop Delete Successfully!', data : {} })
})

// @dec         Get shops within a radius
//@route         /api/v1/shops/:zipcode/:distance
//@access       Private
exports.getShopsInRadius = asyncHandler( async (req, res, next) => {

    const { zipcode, distance } = req.params

    // get lat/lug from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude
    const lng = loc[0].longitude


    // calc radius using radius
    // Divide dist by radius of Earth
    // Earth Radius = 6,378 km

    const radius = distance / 6378 // in km

    const shops = await Shop.find({
        location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } }
    })

    res.status(200).json({ success : true, count : shops.length, data : shops })
})


// @dec         Update shop are open
//@route        Update /api/v1/shops/:id/updateGetOrder
//@access       Privaet
//create by shubham

exports.updateGetOrder = asyncHandler (async (req, res, next) => {
 
    let shopfind = await Shop.findOne({id:req.params.shopId});
    console.log(shopfind.shopClosed)
     if(shopfind.shopClosed !== true){
    shopfind = await Shop.findOneAndUpdate({id:req.params.shopId},  {
        shopClosed : true
    })
    res.status(200).json({ success : true, data : shopfind });  

   }else{
    shopfind = await Shop.findOneAndUpdate({id:req.params.shopId},  {
        shopClosed : false
    }) 
 
    res.status(200).json({ success : true, data : shopfind });  
   }
 
 })




// @dec         Upload photo for bootcamp
//@route        DELETE /api/v1/shops/:id/photo
//@access       Privaet
exports.uploadShopPhoto = asyncHandler (async (req, res, next) => {
    const shop = await Shop.findById(req.params.id)

        if(!shop) {
            return next(new ErrorResponce(`Shop not found with this id ${req.params.id}`, 404));
        }

            // Make Sure user is bootcamp owner
    if(shop.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponce(`User ${req.user.id} is not the owner of this Shop`, 404));
    }

        if(!req.files) {
            return next(new ErrorResponce(`Please Upload a file`, 400))
        }

        const file = req.files.file;

        // Make sure the image is a photo

        if(!file.mimetype.startsWith('image')) {
            return next(new ErrorResponce(`Please upload an image file`, 400))
        }

        // check file size
        if(file.size > process.env.MAX_FILE_UPLOAD){
            return next(new ErrorResponce(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
        }

        // create custom filename
        file.name = `mom-photo-${shop._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if(err) {
                console.error(err);
                return next(new ErrorResponce(`Problem with file upload`, 400))
            }

            await Shop.findByIdAndUpdate(req.params.id, { photo : file.name })

            res.status(200).json({ success : true, data : file.name })
        })

        console.log(file.name)

})


// @dec         Showing Notification of cart with same shop
//@route        create /api/v1/shop/:id/notification
//@access       Privaet
//shubham
exports.showNotification = asyncHandler (async (req, res, next) => {
    const shop = req.params.id;
 
  const Notifications = await Shop.find({ _id: shop },{Notification:1});
 
  return res.status(200).json({ success : true, data : Notifications })
 
 
 
 })


 