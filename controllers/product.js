const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const Shop = require('../models/Shop');
const Payment = require('../models/Payment');
const geocoder = require('../utils/geocoder');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const multer =require('multer');
const { fstat } = require('fs');
const { callbackPromise } = require('nodemailer/lib/shared');
const https = require('https')
const dotenv = require('dotenv');
const qs = require('querystring')
dotenv.config({ path : '../config/config.env' });

// Import paytm checksum utility
const PaytmChecksum = require('../config/cheksum')



// @dec         Get all Products
//@route        GET /api/v1/products
//@access       Public
exports.getProducts = asyncHandler (async (req, res, next) => {
    if(req.params.shopId) {
        const products = await Product.find({ shop : req.params.shopId });
    
        return res.status(200).json({ success : true, count : products.length, data : products })
    } else {
     res.status(200).json(res.advanceResult);
    }
})

// @dec         Get product within a radius
//@route        DELETE /api/v1/shops/:zipcode/:distance
//@access       Public
// create by shubham



exports.getProductInRadius = asyncHandler( async (req, res, next) => {

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
    location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } } },{id:1}) 
     
    const products = await Product.find({ 
      shop: shops            //take id of shops in json formate
    }) 
       
   res.status(200).json({ success : true, count : products.length, data : products })


})

// @dec         Create Products
//@route        POST /api/v1/products
//@access       Private
exports.createProducts = asyncHandler (async (req, res, next) => {
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
  
  // Make Sure user is product owner
  if (shop.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to add Products`,
        404
      )
    );
  }

  const product = await Product.create(req.body);

  res.status(201).json({ success: true, data: product });
})

// @dec         Get single Products
//@route        Get /api/v1/products/:id
//@access       Private
exports.getProduct = asyncHandler (async (req, res, next) => {
    const product = await Product.findById(req.params.id) ;

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({ success : true, data : product })
})

// @dec         Update Products
//@route        PUT /api/v1/products/:id
//@access       Private
exports.updateProduct = asyncHandler (async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`))
    }

      // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Update Products`,
        404
      )
    );
  }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    })

    res.status(200).json({ success : true, data : product })

})

// @dec         Delete Products
//@route        Delete /api/v1/products/:id
//@access       Private
exports.deleteProduct = asyncHandler (async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`))
    }


          // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Delete Products`,
        404
      )
    );
  }

    product = await Product.findByIdAndRemove(req.params.id)

    res.status(200).json({ success : true, msg : 'Product Delete Successfully!' })
})


// @dec         Upload photo for bootcamp
//@route        DELETE /api/v1/products/:id/photo
//@access       Privaet
exports.uploadProductPhoto = asyncHandler (async (req, res, next) => {

if(!req.files){
  const error= new Error('please choose files')
  error.httpStatusCode =400;
  return next(error)
}
  if(req.files){
    console.log(req.files)

    console.log("files uploaded")
}

res.json(req.files)

  
})




  
// @dec         Showing cart product with same shop
//@route        create /api/v1/users/cart
//@access       Privaet
//shubham
exports.showCarttoUser = asyncHandler (async (req, res, next) => {
  req.user.id;

const showCart = await Cart.find({user:`${req.user.id}`},{product:1,_id:0});
  // Make Sure product is find
if (!showCart) {
  return next(
    new ErrorResponce(
      `You have not product Anyy product to showCart`,400
    )
  );
}

return res.status(200).json({ success : true, count : showCart.length, data : showCart })

})



// @dec         Adding to cart product with same shop
//@route        create /api/v1/:productId/:shopId/addtocart
//@access       Privaet
//shubham
exports.addtoCart = asyncHandler (async (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.shop = req.params.shopId;
 req.body.user = req.user.id;
 
const cartofSameShop = await Cart.findOne({shop:req.params.shopId,user:req.user.id},{shop:1,_id:0});
 
     if (!cartofSameShop) {
      return next(
        new ErrorResponce(
          `Product is different from different shop `,400
        )
      );
    }
    let notification = `The user id ${ req.user.id} is order this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `;

    const addtocart = await Cart.create(req.body);
  
    await Shop.findByIdAndUpdate(req.params.shopId,{ $push: { Notification: { $each: [{message : notification ,
      userId:req.user.id,
      shopId:req.params.shopId, 
      productId:req.params.productId,
     }]
    } } } );

    res.status(201).json({ success: true, message:`add product to cart And Send Notification to  Shop Owner(${req.params.shopId})`,data: addtocart });
   
  })

 


// @dec         Adding to Order
//@route        create /api/v1/:productId/:shopId/chechout
//@access       Privaet
//shubham
exports.checkOut = asyncHandler (async (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.shop = req.params.shopId;
 req.body.user = req.user.id;
  
    let notification = `The user id ${ req.user.id} is order this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `;

    const orderCreate = await Order.create(req.body);
  
    await Shop.findByIdAndUpdate(req.params.shopId,{ $push: { Notification: { $each: [{message : notification ,
      userId:req.user.id,
      shopId:req.params.shopId, 
      productId:req.params.productId,
     }]
    } } } );

    res.status(201).json({ success: true, message:`product is Order And Send Notification to  Shop Owner(${req.params.shopId})`,data: orderCreate });
   
  })

 


// @dec         Like Product
//@route        create /api/v1/product/like/:productId
//@access       Private
//@author       kaushal
exports.likeProduct = asyncHandler (async (req, res, next) => {
   const product = await Product.findById(req.params.productId);
  
   // check product has already liked
   if(product.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
     return res.status(400).json({ msg : 'Product already  liked' })
   }

   product.likes.unshift({ user : req.user.id });

   await product.save();

   let likeNotification = `The user id ${ req.user.id} is likes this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `;

   await Shop.findByIdAndUpdate(req.params.shopId,{ $push: { Notification: { $each: [{message : likeNotification ,
     userId:req.user.id,
     shopId:req.params.shopId, 
     productId:req.params.productId,
    }]
   } } } );

  
   res.status(201).json({ success: true, message:`you like this product ` });
  

 
})

// @dec         Unlike Product
//@route        create /api/v1/product/unlike/:productId
//@access       Private
//@author       kaushal
exports.unlikeProduct = asyncHandler (async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  // check product has already liked
  if(product.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
    return res.status(400).json({ msg : 'Product has not yet been liked' })
  }

  // get Remove index
  const removeIndex = product.likes.map(like => like.user.toString()).indexOf(req.user.id);

  product.likes.splice(removeIndex, 1)

  await product.save();

  
  let unlikeNotification = `The user id ${ req.user.id} is unlikes this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `;

  await Shop.findByIdAndUpdate(req.params.shopId,{ $push: { Notification: { $each: [{message : unlikeNotification ,
    userId:req.user.id,
    shopId:req.params.shopId, 
    productId:req.params.productId,
   }]
  } } } );

  res.status(201).json({ success: true, message:`you unlike this product`});
 

})

// @dec         product payment
//@route        create /api/v1/products/payment
//@access       Privaet
//shubham
exports.payment = asyncHandler (async (req, res, next) => {
    req.user.id;
 
          /* import checksum generation utility */
          var data = {};
                 
          /* initialize an array */
          data['MID'] = process.env.MID,
          data['WEBSITE'] = process.env.WEBSITE,
          data['CHANNEL_ID'] = 'WEB',
          data['INDUSTRY_TYPE_ID'] = 'Retail',
          data['CUST_ID'] = "mom -"+ req.user.id+"/"+ req.user.name ,
          data['TXN_AMOUNT'] =req.body.amount,
           data['EMAIL'] =req.body.email,
          data['MOBILE_NO'] = req.body.phone
     
              let dataParams={
                ...data  
            } 
            res.json(dataParams)
       
})


// @dec         payment paynow
//@route        create /api/v1/products/paynow
//@access       Privaet
//shubham
exports.payNow = asyncHandler (async (req, res, next) => {
  //req.user.id;
  
 let body = ''

            const orderId = 'MOM_' + new Date().getTime()

            req.on('error', (err) => {
                console.error(err.stack)
            }).on('data', (chunk) => {
                body += chunk
            }).on('end', () => {
                console.log(body)
                const paytmParams = {}
 
                paytmParams.body = {
                    "requestType": "Payment",       
                    "mid": process.env.MID,
                    "websiteName": process.env.WEBSITE,
                    "orderId": orderId,
                    "callbackUrl": "http://localhost:5000/api/v1/products/callback",
                    "txnAmount": {
                        "value": '12',
                        "currency": "INR", 
                    },
                    "userInfo": {
                        "custId": 'user@gmail.com',
                    }, 
                };

                PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.KEY).then(function (checksum) {

                    paytmParams.head = {
                        "signature": checksum
                    };

                    var post_data = JSON.stringify(paytmParams);

                    var options = {

                        /* for Staging */
                        hostname: 'securegw-stage.paytm.in',

                        /* for Production */
                        // hostname: 'securegw.paytm.in',

                        port: 443,
                        path: `/theia/api/v1/initiateTransaction?mid=${process.env.MID}&orderId=${orderId}`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': post_data.length
                        }
                    };

                    var response = "";
                    var post_req = https.request(options, function (post_res) {
                        post_res.on('data', function (chunk) {
                            response += chunk;
                        });

                        post_res.on('end', function () {
                            response = JSON.parse(response)
                            console.log('txnToken:', response);
                            let data = JSON.stringify({
                                    mid: process.env.MID,
                                    orderId:orderId,
                                    txnToken:response.body.txnToken,
                                    actionurl:`https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${process.env.MID}&orderId=${orderId}`  
                               }) 
                               res.writeHead(200, { 'Content-Type': 'text/html' })
                           res.write(data)
                            res.write(`<html>
                            <head>
                                <title>Show Payment Page</title>
                            </head>
                            <body>
                                <center>
                                    <h1>Please do not refresh this page...</h1>
                                </center>
                                <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${process.env.MID}&orderId=${orderId}" name="paytm">
                                    <table border="1">
                                        <tbody>
                                            <input type="hidden" name="mid" value="${process.env.MID}">
                                                <input type="hidden" name="orderId" value="${orderId}">
                                                <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                                     </tbody>
                                  </table>
                                                <script type="text/javascript"> document.paytm.submit(); </script>
                               </form>
                            </body>
                         </html>`)
                            res.end()
                        });
                    });
                    post_req.write(post_data);
                    post_req.end();
                });
            })

})


// @dec         payment call back
//@route        create /api/v1/products/callback
//@access       Privaet
//shubham
exports.callBack = asyncHandler (async (req, res, next) => {
         //     req.body.user = req.user.id;
             
             let callbackResponse = ''
            
             req.on('error', (err) => {
                 console.error(err.stack)
             }).on('data', (chunk) => {
                 callbackResponse += chunk
             }).on('end', () => {
                 let data = qs.parse(callbackResponse)
                 console.log(data)
            
                 data = JSON.parse(JSON.stringify(data))
            
                 const paytmChecksum = data.CHECKSUMHASH
            
                 var isVerifySignature = PaytmChecksum.verifySignature(data, process.env.KEY, paytmChecksum)
                 if (isVerifySignature) {
                     console.log("Checksum Matched");
            
                     var paytmParams = {};
            
                     paytmParams.body = {
                         "mid": process.env.MID,
                         "orderId": data.ORDERID,
                     };
            
                     PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.KEY).then(function (checksum) {
                         paytmParams.head = {
                             "signature": checksum
                         };
            
                         var post_data = JSON.stringify(paytmParams);
            
                         var options = {
            
                             /* for Staging */
                             hostname: 'securegw-stage.paytm.in',
            
                             /* for Production */
                             // hostname: 'securegw.paytm.in',
            
                             port: 443,
                             path: '/v3/order/status',
                             method: 'POST',
                             headers: {
                                 'Content-Type': 'application/json',
                                 'Content-Length': post_data.length
                             }
                         };
            
                         // Set up the request
                         var response = "";
                         var post_req = https.request(options, function (post_res) {
                             post_res.on('data', function (chunk) {
                                 response += chunk;
                             });
            
                             post_res.on('end', function () {
                                 console.log('Response: ', response);
                                 res.writeHead(200, { 'Content-Type': 'text/html' })
                                 res.write(response)
                                 Payment.create({ paymentDetail: response }); 
                                 res.write(`<html>
                                 <head>
                                     <title>payment sucessful</title>
                                 </head>
                                 <body>
                                     <center>
                                         <h1>Payment Successful enjoy other</h1>
                                     </center>
                                     <form method="post" action="http://localhost:5000/api/v1/products/" name="paytm">
                                         <table border="1">
                                             <tbody>
                                                 <input type="hidden" name="mid" value="${process.env.MID}">
                                           </tbody>
                                       </table>
                                                     <script type="text/javascript"> document.paytm.submit(); </script>
                                    </form>
                                 </body>
                              </html>`)
          
                                  res.end()
                             });
                         });
            
                         // post the data
                         post_req.write(post_data);
                         post_req.end();
                     });
                 } else {
                     console.log("Checksum Mismatched");
                 }
             })
             
})
 