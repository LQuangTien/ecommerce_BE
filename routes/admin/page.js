const express = require("express");

const { create, get } = require("../../controllers/admin/page");
const { upload, requireSignin, isAdmin } = require("../../middlewares");

const router = express.Router();

router.get("/page/:category/:type", get);
router.post(
  "/page/create",
  upload.fields([{ name: "banners" }, { name: "products" }]),
  requireSignin,
  isAdmin,
  create
);

module.exports = router;
