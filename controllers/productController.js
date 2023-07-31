import productModel from "../models/productModel.js";
import ProductFeatures from "../utils/proFeatures.js";
import cloudinary from 'cloudinary';


// Create product -- Admin
export const createProduct = async(req,res,next)=>{
    try {        
        const {name,description,price,category,stock,image=""} = req.body;
        let newProductData = {name,description,price,category,stock,image}

        const myCloud = await cloudinary.v2.uploader.upload(image,{
            folder: "products",
            width: 200,
            crop: "scale"
        });
        newProductData.image = {
            public_id: myCloud?.public_id,
            url: myCloud?.secure_url
        }

        await productModel.create(newProductData);

        res.status(201).json({
            success:true,
            message:"Product is created"
        });
    } catch (error) {
        next(error);
    };
};

// Get all products
export const getAllProducts = async(req,res,next)=>{
    try {
        const resultPerPage = 4;

        const productsCount = await productModel.countDocuments();

        const productFeature = new ProductFeatures(productModel.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);

        const products = await productFeature.query;
        // console.log(productFeature.query);

        let filterProductsCount = products.length;

        res.status(200).json({
            success:true,
            resultPerPage,
            productsCount,
            filterProductsCount,
            products
        });
    } catch (error) {
        next(error)
    };
};

// Get product details
export const getProductDetails = async(req,res,next)=>{
    try {
        let product = await productModel.findById(req.params.id);
        res.status(200).json({
            success:true,
            product
        });
    } catch (error) {
        next(error);
    };
};

// Update product -- Admin
export const updateProduct = async(req,res,next)=>{
    try {
        const {name,description,price,category,stock,image=""} = req.body;
        const newProductData = {name,description,price,category,stock};

        if(image!==""){
            const product = await productModel.findById(req.params.id);

            const imageId = product.image.public_id;
            await cloudinary.v2.uploader.destroy(imageId);

            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder: "products",
                width: 150,
                crop: "scale"
            });
            newProductData.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        };
        await productModel.findByIdAndUpdate(req.params.id, newProductData, {
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        
        res.status(200).json({
            success:true,
            message:"Product is updated"
        });
    } catch (error) {
        next(error);
    }
};

// Delete product -- Admin
export const deleteProduct = async(req,res,next)=>{
    try {
        const product = await productModel.findByIdAndDelete(req.params.id);
        if(!product) return next(ErrorHandler("Product not found", 404));
        res.status(200).json({
            success:true,
            message:"Product delete successfully"
        });
    } catch (error) {
        next();
    }
};

// Create or Update product review
export const giveProductReview = async(req,res,next)=>{
    try {
        const {_id, name} = req.user;
        const {productId, rating, comment} = req.body;

        const review = {
            user:_id,
            name,
            rating:Number(rating),
            comment
        };

        const product = await productModel.findById(productId);
        const isReviewed = product.reviews.find(rev=>rev.user.toString() === _id.toString());

        // Product Reviews
        if(isReviewed){
            product.reviews.forEach(rev=>{
                if(rev.user.toString() === _id.toString()){
                    product.reviews.pop(rev);
                };
            });
            product.reviews.push(review);
        }else{
            product.reviews.push(review);
        };
        
        // Product number of reviews
        product.numOfReviews = product.reviews.length;
        
        // Product Ratings
        let total = 0;
        product.reviews.forEach(rev=>{
            total+=rev.rating;
        });
        product.ratings = total/product.reviews.length;

        await product.save({validateBeforeSave:false});
        res.status(200).json({success:true});

    } catch (error) {
        next(error);
    };
};

// Get all reviews of product
export const getProductReviews = async(req,res,next)=>{
    try {
        const {productId} = req.query;

        const product = await productModel.findById(productId);
        if(!product) return next(ErrorHandler("Product not found", 404));

        res.status(200).json({
            success:true,
            reviews: product.reviews
        });
    } catch (error) {
        next();
    }
};

// Delete product review
export const deleteProductReview = async(req,res,next)=>{
    const {productId,reviewId} = req.query;
    try {
        const product = await productModel.findById(productId);
        if(!product) return next(ErrorHandler("Product not found", 404));

        let reviews = [];
        reviews = product?.reviews?.filter(rev=> rev._id.toString() !== reviewId);

        // // Product number of reviews
        const numOfReviews = reviews?.length;
        
        // // Product Ratings
        let total = 0;
        reviews?.forEach(rev=>{
            total+=rev.rating;
        });
        const ratings = total !== 0 ? total/numOfReviews : 0;
        console.log(ratings)

        await productModel.findByIdAndUpdate(productId,{reviews,numOfReviews,ratings},{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        res.status(200).json({success:true});

    } catch (error) {
        next();
    }
};