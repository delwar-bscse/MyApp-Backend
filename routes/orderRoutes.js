import express from 'express';
import { braintreePayment, braintreeToken, deleteOrder, getAllOrders, getOrders, orderStatus, singleOrder } from '../controllers/orderControllers.js';
import { isAdmin, isUser } from '../middlewares/authentication.js';

const router = express.Router();

//Order Routes//

//Braintree ClientToken
router.get('/braintree-token', isUser, braintreeToken);

//Braintree Payment
router.post('/braintree-payment', isUser, braintreePayment);

//Orders for User
router.get('/orders', isUser, getOrders);

//All Orders for Admin
router.get('/all-orders', isUser, isAdmin, getAllOrders);

//Order status update
router.put('/order-status/:orderId', isUser, isAdmin, orderStatus);

//Single Order
router.get('/single-order/:orderId', isUser, isAdmin, singleOrder);

//Order Delete
router.delete('/order-delete/:orderId', isUser, isAdmin, deleteOrder);


export default router;