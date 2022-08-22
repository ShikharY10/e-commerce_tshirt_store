const User = require('../models/userModels');
const BigPromise = require('../middlewares/bigpromise');
const CustomError = require('../utils/customerror');
const cookieToken = require('../utils/cookietoken');
const fileUpload = require('express-fileupload');
const mailHelper = require('../utils/emailhelper');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

exports.signup = BigPromise( async (req, res, next) => {
    let result;

    if (req.files) {
        let file = req.files.photo;

        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })
    }

    const {name, email, password} = req.body;

    if (!name || !email || !password) {
        return next(new CustomError("Name, email and password is required", 400))
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: (result === undefined) ? {} : {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res);

})

exports.login = BigPromise( async (req, res , next) => {
    const {email, password} = req.body;

    // check for the presence of email and password
    if (!email || !password) {
        return next(new CustomError("Please provide email and password", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if (!user) {
        return next(new CustomError("Email and password not matched", 400))
    }

    const isPasswordCorrect = await user.isPasswordValidated(password)

    // if password does not matched
    if (!isPasswordCorrect) {
        return next(new CustomError("Email and password not matched", 400))
    }

    // sending the token
    cookieToken(user, res);
})

exports.logout = BigPromise( async (req, res , next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logout successful"
    })
})

exports.forgotPassword = BigPromise( async (req, res , next) => {
    const {email} = req.body;
    const user = await User.findOne({email})

    if (!user) {
        return next(new CustomError("Email not found", 400))
    }

    const forgotPasswordToken = user.getForgotPasswordToken();

    await user.save({validateBeforeSave: false})

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotPasswordToken}`

    const message =  `Copy paste this link in your URL and hit enter \n\n\t${myUrl}`;

    try {
        await mailHelper({
            email: user.email,
            subject: "LCO T-Shirt Store - Password Reset Email",
            message
        })

        res.status(200).json({
            success: true,
            message: "email send successfully"
        })
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave: false})

        return next(new CustomError(error.message, 500))
    }
})

exports.resetPassword = BigPromise( async (req, res , next) => {
    const token = req.params.token;

    const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        encryptedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if (!user) {
        return next(new CustomError("Token is invalid or expired", 400))
    }

    if (req.body.password !== req.body.confirmpassword) {
        return next(new CustomError("Password and confirmPassword is not matched", 400))
    }

    user.password = req.body.password;

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    cookieToken(user, res)
})

exports.getLoggedInUserDetails = BigPromise( async (req, res , next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = BigPromise( async (req, res , next) => {
    const userId = req.user.id
    const user = await User.findById(userId).select("+password");

    const isOldPasswordCorrect = await user.isPasswordValidated(req.body.oldPassword);

    if (!isOldPasswordCorrect) {
        return next(new CustomError("Old password is incorrect", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    cookieToken(user, res);
})

exports.updateUserDetails = BigPromise( async (req, res , next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.files) {

        try {
            const imageId = req.user.photo.id;
            const resp = await cloudinary.uploader.destroy(imageId);
            console.log("previouse pic found");
        } catch (error) {
            console.log("no previouse pic found");
        }

        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })
        
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const newUserData = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        newUserData
    });
})

// admin
exports.adminGetAllUsers = BigPromise( async (req, res , next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    })
})

exports.adminGetOneUser = BigPromise( async (req, res , next) => {
    console.log(`ID: ${req.params.id}`)
    const user = await User.findById(req.params.id);

    console.log(`user: ${user}`); 

    if (!user) {
        return next(new CustomError("No user found", 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminUpdateOneUserDetail = BigPromise( async (req, res , next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });


})

exports.adminDeleteOneUser = BigPromise( async (req, res , next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new CustomError("No user found!", 400))
    }

    if (user.photo) {
        await cloudinary.uploader.destroy(user.photo.id);
    }

    res.status(200).json({
        success: true,
        user,
    })
})

// manager
exports.managerAllUsers = BigPromise( async (req, res , next) => {
    const users = await User.find({role: "user"});

    res.status(200).json({
        success: true,
        users,
    })
})

