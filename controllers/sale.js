const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const User =require('../models/User')
const Shop =require('../models/Shop')
const geocoder = require('../utils/geocoder');
const Sales = require('../models/Sales');



// @dec         Get all salespersons
//@route        GET /api/v1/sales
//@access       Public
exports.getSales = asyncHandler (async (req, res, next) => {

        const sale = await User.find({ role: 'sales' });
    
        return res.status(200).json({ success : true, count:sale.length, data : sale })
  
})

  
// @dec         Get single salesperons
//@route        Get /api/v1/sales/:id
//@access       Private
exports.getSale = asyncHandler (async (req, res, next) => {
    const sale = await User.find({_id: req.params.id, role: 'sales'}) ;

    if(!sale) {
        return next(new ErrorResponce(`saleperson not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({ success : true, data : sale })
})
 


// @dec         Get sales person within a radius
//@route        Get /api/v1/sales/:zipcode/:distance
//@access       Private
exports.getSalesInRadius = asyncHandler( async (req, res, next) => {

    const { zipcode, distance } = req.params

    // get lat/lug from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude
    const lng = loc[0].longitude


    // calc radius using radius
    // Divide dist by radius of Earth
    // Earth Radius = 6,378 km

    const radius = distance / 6378 // in km

    const sales = await User.find({
        location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } },role:'sales'
    })

    res.status(200).json({ success : true, count : sales.length, data : sales })
})




// @dec         Create sales
// @route        POST /api/v1/createsales
// @access       private/ ADmin
exports.createSales = asyncHandler(async (req, res, next) => {
 
    req.body.role = 'sales';

    const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @dec         Update sales
// @route        PUT /api/v1/sales/:id
// @access       private/ ADmin
exports.updateSales = asyncHandler(async (req, res, next) => {
  const sale = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: sale });
});

// @dec         Delete sales
// @route        Delete /api/v1/sales/:id
// @access       private/ ADmin
exports.deleteSales = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({ success: true, data: {} });
});



// @dec         Verify shop
// @route        verify shop /api/v1/sales/:id/verifyshop/:shopID
// @access       private/ ADmin /Sales
exports.verifyShop = asyncHandler(async (req, res, next) => {
 

  const sale = await Sales.findOne({shop: req.params.shopId, sales:req.params.id}) ;

  if(sale) {
      return next(new ErrorResponce(`shop is already verify by salesperson`,500))
  }
   
  const verifypin = await Shop.findById(req.params.shopId)
  console.log(verifypin.verifyPin)
  if(verifypin.verifyPin!==req.body.pin) {
    return next(new ErrorResponce(`Pin are Not Matching`,500))
}

 
  const verifyShop = await Shop.findByIdAndUpdate(req.params.shopId, {
    isVerified : true,
    sale : req.params.id,
   })

   const createsales = await Sales.create({
     shop:req.params.shopId,
     sales:req.params.id,
   });

  
  res.status(200).json({ success: true, message:`Shop ${req.params.shopId} is verified ${req.params.id}` , salesverify:createsales });
});



// @dec         showing Shop Verify By Sale
// @route        create /api/v1/sales/:id
// @access       Privaet
// shubham
exports.showShopVerifyBySale = asyncHandler (async (req, res, next) => {
  const sale = req.params.id;

const VerifyShop = await Shop.find({ sale:sale },{Notification:0,location:0});

return res.status(200).json({ success : true, No:VerifyShop.length , data : VerifyShop })



}) 