const express = require('express');
const { 
    isLoggedIn,
    customRole,
} = require('../middlewares/user');
const {
    createOrder,
    getOneOrder,
    getLoggedInOrder,
    adminGetAllOrder,
    adminUpdateOneOrder,
    adminDeleteOneOrder
} = require('../controllers/orderController')

const router = express.Router();

// user routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/getmyorder").get(isLoggedIn, getLoggedInOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);

// admin routes
router.route("/admin/orders").get(isLoggedIn, customRole("admin"), adminGetAllOrder);
router.route("/admin/order/:id").put(isLoggedIn, customRole("admin"), adminUpdateOneOrder)
router.route("/admin/order/:id").delete(isLoggedIn, customRole("admin"), adminDeleteOneOrder)

module.exports = router;
