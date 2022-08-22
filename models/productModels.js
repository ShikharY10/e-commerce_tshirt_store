const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide product name"],
        trim: true,
        maxlength: [120, "Product name should not be greater than 120"],
    },
    price: {
        type: Number,
        required: [true, "Please provide product price"],
        maxlength: [5, "Product price should not be greater than 5"],
    },
    description: {
        type: String,
        required: [true, "Please provide product name"],
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please select category from- short-sleevs, long-sleeves, sweat-shirt, hoodies"],
        enum: {
            values: [
                'short-sleeves',
                'long-sleeves',
                'sweat-shirt',
                'hoodies',
            ],
            message: "Please select category from - shortsleevs, longsleeves, sweatshirt, hoodies"
        },
        
    },
    stocks : {
        type: Number,
        required: [true, "Please add a number is stocks field"],
    },
    brand: {
        type: String,
        required: [true, "Please add brand name for the product"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required :true,
            },
            comment: {
                type: String,
                required: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required :true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})


module.exports = mongoose.model('Product', productSchema);