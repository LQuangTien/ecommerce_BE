const cartRoutes = require("./cart");
const authRoutes = require("./auth");
const orderRoutes = require("./order");
const productRoutes = require("./product");
const addressRoutes = require("./address");
const categoryRoutes = require("./category");

const adminRoutes = require("./admin/auth");
const adminOrderRoutes = require("./admin/order");
const initialDataRoutes = require("./admin/initialData");
const statistic = require("./admin/statistic");
const seed = require("./admin/seedData");
module.exports = [
  cartRoutes,
  authRoutes,
  orderRoutes,
  productRoutes,
  addressRoutes,
  categoryRoutes,
  adminRoutes,
  adminOrderRoutes,
  initialDataRoutes,
  statistic,
  seed,
];
