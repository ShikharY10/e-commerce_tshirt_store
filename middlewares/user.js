const User = require('../models/userModels');
const BigPromise = require('../middlewares/bigpromise');
const CustomError = require('../utils/customerror');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    console.log(`cookie-token: ${req.cookies.token}`);
    const token = req.cookies.token;

    if (!token) {
        return next(new CustomError("Login first to access this page", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id);

    next();
})

exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError("You are not allowed for this resource", 403))
        }
        next();
    }
}

