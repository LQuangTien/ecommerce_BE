const express = require("express");

const { requireSignin, isAdmin } = require("../middlewares");
const {
  add,
  get,
  getById,
  zaloPayment,
  verifyZaloPayment,
  getOrderStatus,
  seedData,
  checkUserHasBoughtProduct,
  paypalPayment,
} = require("../controllers/order");

const router = express.Router();

router.get("/user/orders", requireSignin, get);
router.post("/user/order/add", requireSignin, add);
// router.get("/user/order/momoPayment",momoPayment);

router.post("/user/order/zaloPayment", requireSignin, zaloPayment);
router.post("/user/order/getOrderStatus", requireSignin, getOrderStatus);

router.post("/user/order/paypalPayment", requireSignin, paypalPayment);
// router.get("/user/order/getOrderStatus", getOrderStatus);

router.get("/user/order/:_id", requireSignin, getById);
router.get("/user/order/checkUserHasBoughtProduct/:productId", requireSignin, checkUserHasBoughtProduct);

module.exports = router;
