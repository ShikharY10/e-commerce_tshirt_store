const BigPromise = require('../middlewares/bigpromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Stripe Payment System
exports.sendStripeKey = BigPromise( async (req, res, next) => {
    res.status(200).json({
        stripekey: Process.env.STRIPE_PUBLISHABLE_KEY
    });
});

exports.captureStripePayment = BigPromise( async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",

        // optional
        metadata: {integration_check: 'accept_a_payment'}
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
    })
})

// Razorpay Payment System
exports.sendRazorpayKey = BigPromise( async (req, res, next) => {
    res.status(200).json({
        razorpayapiid: Process.env.RAZORPAY_KEY_ID
    });
})

exports.captureRazorpayPayment = BigPromise( async (req, res, next) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    })

    const options = {
        amount: req.body.amount,
        current: "inr",
        receipt: crypto.randomBytes(20).toString('hex')
    };

    const myOrder = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})
