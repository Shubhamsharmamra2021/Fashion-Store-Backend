const express = require("express");
const { addtoCart,checkOut, uploadProductPhoto, createProducts,showCarttoUser,
   getProducts, getProduct, updateProduct, deleteProduct, getProductInRadius,
    likeProduct, unlikeProduct, payment, payNow, callBack} = require("../controllers/product");
const { createChatroom, chatroomMessage, productChatroom} = require("../controllers/chatroom")
const Product = require("../models/Product");
const advanceResult = require("../middleware/advanceResult");
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const store = require('../middleware/multer');

//create product , get product with shop location
router.route("/").post(protect, createProducts).get(advanceResult(Product, { path: "shop", select: "name, location",}), getProducts);
//productinradius
  router.route("/radius/:zipcode/:distance").get(getProductInRadius),
//create chatroom  
  router.route("/:productId/:shopId").post(protect,createChatroom),
//go to catroom  
  router.route("/:productId/:shopId/chatroom/:chatId").post(protect,productChatroom),
//chatroommessage   
  router.route("/:productId/:shopId/chatroom/:chatId").get(protect,chatroomMessage),
//add to cart
  router.route("/:productId/:shopId/addtocart").post(protect,addtoCart),

//add to Order
router.route("/:productId/:shopId/checkout").post(protect,checkOut),

//show cart to user  
  router.route("/cart").get(protect,showCarttoUser),

//like product 
router.route("/like/:productId/:shopId").put(protect, likeProduct),
//unlike product
router.route("/unlike/:productId/:shopId").put(protect, unlikeProduct),

router.route("/payment").post(protect, payment),

router.route("/paynow").post(protect, payNow),    

router.route("/callback").post(protect, callBack),

//getproduct, updateproduct, deleteproduct
router.route("/:id").get(getProduct).put(protect, authorize("vendor", "admin"), updateProduct).delete(protect, authorize("vendor", "admin"), deleteProduct);
  
//uploadmultiplephoto  
router.route("/photo").post(store.array([{ name: 'file', maxCount: 10 }]),uploadProductPhoto);


module.exports = router;