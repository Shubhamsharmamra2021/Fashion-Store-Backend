const express = require("express");
const {
  getUsers,getUser,
  createUsers,updateUsers,deleteUsers} = require("../controllers/users");
const router = express.Router();
 

const User = require("../models/User");
const advanceResult = require("../middleware/advanceResult");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advanceResult(User), getUsers).post(createUsers);

router.route("/:id").get(getUser).put(updateUsers).delete(deleteUsers);

 module.exports = router;
