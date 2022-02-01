const express = require("express");

const { isAdmin, requireSignin } = require("../../middlewares");
const {
  initialData,
  totalOrderPricePerMonthByYear,
} = require("../../controllers/admin/initialData");

const router = express.Router();
//requireSignin, isAdmin,
router.get("/admin/initialdata", requireSignin, isAdmin, initialData);
router.get(
  "/admin/totalOrderPricePerMonthByYear",
  requireSignin,
  isAdmin,
  totalOrderPricePerMonthByYear
);

module.exports = router;
