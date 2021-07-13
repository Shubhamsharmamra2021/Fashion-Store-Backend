const express = require('express');
const {
  getMe,
  updateDetails,
  getMyShop,
  loginViaOtp,
  verifyOtp,
  addProfile,
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post("/loginviaOtp", loginViaOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/me", protect, getMe);
router.post("/myshop", protect, getMyShop);
router.put("/updatedetails", protect, updateDetails);
router.post("/profile", protect, addProfile);

module.exports = router