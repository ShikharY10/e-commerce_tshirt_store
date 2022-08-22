const BigPromise = require('../middlewares/bigpromise');
const Order = require('../models/orderModel');
const Product = require('../models/productModels');
const CustomError = require('../utils/customerror');

exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return next(new CustomError(`No product is found for id : ${req.params.id}`, 401))
    }

    res.status(200).json({
        success: true,
        order
    })
})

exports.getLoggedInOrder = BigPromise(async (req, res, next) => {
    const userId = req.user._id;
    const order = await Order.find({user: userId})

    if (!order) {
        return next(new CustomError(`No product is related to given user id : ${userId}`))
    }

    res.status(200).json({
        success: true,
        order
    })
})

exports.adminGetAllOrder = BigPromise(async (req, res, next) => {
    const order = await Order.find()

    res.status(200).json({
        success: true,
        order
    })
})

exports.adminUpdateOneOrder = BigPromise(async (req, res, next) => {
    const order = Order.findById(req.params.id);

    if (order.orderStatus == "delivered") {
        return next(new CustomError("Order is already marked as delivers", 401))
    }

    order.orderStatus = req.body.Status;
    order.orderItems.forEach(async (prod) => {
        await updateProductStocks(prod.product, prod.quantity);
    })

    await order.save();

    res.status(200).json({
        success: true,
        order
    })

})

exports.adminDeleteOneOrder = BigPromise(async (req, res, next) => {
    const orderId = req.params.id

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        success: true,
        message: "Order is deleted successfully",
    })
})

async function updateProductStocks(productId, quantity) {
    const product = await Product.findById(productId)
    product.stocks = product.stocks - quantity;
    await product.save({validateBeforeSave: false});
}