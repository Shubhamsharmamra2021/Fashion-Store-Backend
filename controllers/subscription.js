const ErrorResponce = require('../utils/errorResponce');
const Shop = require('../models/Shop');
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const asyncHandler = require('../middleware/async');

// @desc    Add Subscription
// @route   POST
// @access  Private

exports.addSubscription = asyncHandler(async (req, res, next) => {
    req.body.shop = req.params.shopId;
    req.body.user = req.user.id;
  
    const shop = await Shop.findById(req.params.shopId);
  
    if (!shop) {
      return next(
        new ErrorResponce(
          `No Shop found to add products on this ${req.params.shopId} id`
        )
      );
    }
  
    // Make Sure user is bootcamp owner
    if (shop.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponce(
          `User ${req.user.id} is not the owner of this Shop to add Products`,
          404
        )
      );
    }
  
    const subscription = await Subscription.create(req.body);
  
    res.status(201).json({ success: true, data: subscription });
})
