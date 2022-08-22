const express = require('express');
const router = express.Router();
const { 
    isLoggedIn,
    customRole
} = require('../middlewares/user');
const {
    signup,
    login, 
    logout, 
    forgotPassword, 
    resetPassword,
    getLoggedInUserDetails,
    changePassword,
    updateUserDetails,
    adminGetAllUsers,
    managerAllUsers,
    adminGetOneUser,
    adminUpdateOneUserDetail,
    adminDeleteOneUser
} = require('../controllers/userController');

// user routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// admin routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminGetAllUsers);
router.route("/admin/user/:id").get(isLoggedIn, customRole("admin"), adminGetOneUser);
router.route("/admin/user/:id").put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetail);
router.route("/admin/user/:id").delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);


// manager routes
router.route("/manager/users").get(isLoggedIn, customRole("manager"), managerAllUsers);

module.exports = router;