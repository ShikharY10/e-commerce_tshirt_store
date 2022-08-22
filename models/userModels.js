const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// user model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40, "Name can not be more than 40 characters"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        validator: [validator.isEmail, "Please enter email in correct format"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password should be at least 6 char long"],
        select: false,
    },
    role: {
        type: String,
        default: "user",

    },
    photo: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// ecnrypt password before save - HOOKS
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// password validator
userSchema.methods.isPasswordValidated = async function(userSendPassword) {
    return await bcrypt.compare(userSendPassword, this.password)
}

// method for create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign(
        {id: this._id},
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRY}
    );
}

// to generate forgot password token (random string)
userSchema.methods.getForgotPasswordToken = function() {
    // generate a long random string
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting a  hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(forgotToken)
        .digest('hex');

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20*60*1000;

    return forgotToken;
}

// exports:
module.exports = mongoose.model("User", userSchema);