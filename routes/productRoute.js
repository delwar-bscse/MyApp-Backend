import express from "express";
import { isAdmin, isUser } from "../middlewares/authentication.js";
import { createProduct, deleteProduct, deleteProductReview, getAllProducts, getProductDetails, getProductReviews, giveProductReview, updateProduct } from "../controllers/productController.js";

const router = express.Router();

// Product Routes
router.route('/create-product').post(isUser, isAdmin, createProduct);
router.route('/all-products').get(getAllProducts);
router.route('/product-details/:id').get(getProductDetails);
router
    .route('/admin/product/:id')
    .put(isUser, isAdmin, updateProduct)
    .delete(isUser, isAdmin, deleteProduct);

router.route('/put-review').put(isUser, giveProductReview);
router.route('/see-reviews').get(getProductReviews);
router.route('/delete-review').delete(isUser,isAdmin, deleteProductReview);

export default router;