// Controller file
// Language: javascript
// Path: controllers/userController.js
// Author: Shikhar Yadav

// middleware for error handling
const BigPromise = require("../middlewares/bigpromise.js");

// home route function
exports.home = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello From API"
    });
});

// home dummy route
exports.homeDummy = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello From dummy route"
    })
})