const express = require("express");
const router = express.Router({ mergeParams: true });

const { addSubscription, demo } = require("../controllers/subscription");
const { protect, authorize } = require("../middleware/auth");

router.route("/").post(protect, addSubscription)

module.exports = router;
