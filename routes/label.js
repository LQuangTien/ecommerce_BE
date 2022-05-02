const express = require("express");

const { requireSignin, isAdmin } = require("../middlewares");
const { get, getAll, create, update, remove } = require("../controllers/label");

const router = express.Router();

router.get("/label/:id", requireSignin, isAdmin, get);
router.get("/label", requireSignin, isAdmin, getAll);
router.post("/label", requireSignin, isAdmin, create);
router.put("/label/:id", requireSignin, isAdmin, update);
router.delete("/label/:id", requireSignin, isAdmin, remove);

module.exports = router;
