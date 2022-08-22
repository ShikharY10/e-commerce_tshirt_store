// Product Controller file
// Language: javascript
// Path: controllers/productController.js
// Author: Shikhar Yadav

const Product = require('../models/productModels');
const BigPromise = require('../middlewares/bigpromise');
const CustomError = require('../utils/customerror');
const cloudinary = require('cloudinary').v2;
const WhereClause = require('../utils/whereclause');
const findIndex = require('../utils/utilities');

exports.addProduct = BigPromise( async (req, res, next) => {
    // images
    let imageArray = [];

    if (!req.files) {
        return next(new CustomError("Images are required", 401));
    } 
    if (req.files) {

        const photos = req.files.photos;
        console.log(photos);

        for (let index = 0; index < photos.length; index++) {
            
            let result = await cloudinary.uploader.upload(
                photos[index].tempFilePath,
                {
                    folder: "products"
                }
            )
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = req.user.id

    const product = await Product.create(req.body)

    res.status(200).json({
        success: true,
        product
    })
})

exports.getAllProduct = BigPromise(async (req, res, next) => {
    const resultPerPage = 6;
    
    const productsObj = new WhereClause(Product.find(), req.query).search().filter();
    const products = productsObj.base;
    const filterProductCount = products.length;

    productsObj.pager(resultPerPage);
    const productsPage = await productsObj.base.clone();

    res.status(200).json({
        success: true,
        filterCount: filterProductCount,
        product: productsPage,
    })
})

exports.getOneProduct = BigPromise( async (req, res, next) => {
    const productId = req.params.id;
    const product = await Product.findById(productId)
    if (!product) {
        return next(new CustomError(`No product is found for id: ${productId}`, 400))
    }

    res.status(200).json({
        success: true,
        product
    })
})

exports.addReview = BigPromise( async (req, res, next) => {
    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const alreadyReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (alreadyReview) {
        product.reviews.forEach( (review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length;
    }

    // adjust rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({validateBeforeSave: false})

    res.status(200).json({success: true})
})

exports.deleteReview = BigPromise( async (req, res, next) => {
    const {productId} = req.query;

    const product = await Product.findById(productId)

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.legth

    // adjust rating
    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // update the product
    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberOfReviews,
    }, {
        new: true,
        runValidator: true,
        useFindAndModify: true
    })

    res.status(200).json({success: true})
})

exports.getAllReviewsForOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    res.status(200).josn({
        success: true,
        reviews: product.reviews
    })
})

exports.adminGetOneProduct = BigPromise(async (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return next(new CustomError("Please send id", 400))
    }
    const product = await Product.findById(id)

    if (!product) {
        return next(new CustomError(`No product found for id: ${id}`, 400))
    }

    res.status(200).json({
        success: true,
        products: [product],
    })
})

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products: products
    })
})

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    var isPhotosChanged = false;

    const id = req.params.id
    const product = await Product.findById(id);
    if (!product) {
        return next(new CustomError(`No product is found for id : ${id}`, 400))
    }

    const newProduct = {};
    var updatePhotos = product.photos;

    if (req.body.deletephotos) {
        const deleteArray = [];
        for (var indx = 0; indx < req.body.deletephotos.length; indx++) {
            const index = findIndex(updatePhotos, req.body.deletephotos[indx])
            if (index > 0) {
                await cloudinary.uploader.destroy(req.body.deletephotos[indx]);
                deleteArray.push(index);
                isPhotosChanged =  true;
            }
        }
        delete req.body["deletephotos"];
        deleteArray.forEach((index) => {
            delete updatePhotos[index];
        })
    }

    if (req.files) {
        const photos = req.files.photos;
        if (photos.length) {
            for (let index = 0; index < photos.length; index++) {
                const result = await cloudinary.uploader.upload(
                    photos[index].tempFilePath,
                    {
                        folder: "products"
                    }
                )
                isPhotosChanged =  true;
                updatePhotos.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        } else {
            const result = await cloudinary.uploader.upload(
                photos.tempFilePath,
                {
                    folder: "products"
                }
            );
            isPhotosChanged =  true;
            updatePhotos.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    for (const [key, value] of Object.entries(req.body)) {
        if (key && value)
            newProduct[key] = value;
    }

    if (isPhotosChanged)
        newProduct.photos = updatePhotos;
    
    const newProductData = await Product.findByIdAndUpdate(id, newProduct, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success:  true,
        newProductData
    })
})

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
    const id = req.params.id

    const product = await Product.findById(id)

    if (!product) {
        return next(new CustomError(`No product is found for id - ${id}`, 400))
    }

    for (let index = 0; index < product.photos.length; index++) {
        const photo = product.photos[index];
        if (photo !== null) {
            console.log({"photo": photo.id});
            await cloudinary.uploader.destroy(photo.id)
        }
        
    }

    await Product.findByIdAndDelete(id)

    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})
