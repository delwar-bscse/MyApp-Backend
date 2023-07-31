import braintree from 'braintree';
import orderModel from '../models/orderModel.js';
import dotenv from 'dotenv';

dotenv.config();




var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
  });

//Order's token create
export const braintreeToken = async(req,res) =>{
    try {
        await gateway.clientToken.generate({}, (error, response)=>{
            if(error){
                res.status(500).send(error);
            }else{
                res.status(200).send(response);
            };
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(err);
    };
};

//Make payment
export const braintreePayment = async(req,res) =>{
    try {
        const {cart, shippingInfo, totalPrice, nonce} = req.body;
        
        await gateway.transaction.sale({
            amount: totalPrice,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, async(error, result)=>{
            if(result){
                const order = await new orderModel({
                    buyer: req.user._id,
                    paymentInfo:{
                        id:result.transaction.id,
                        status:result.transaction.status,
                    },
                    orderItems:cart,
                    totalPrice,
                    shippingInfo
                }).save();
                res.status(200).json({ok:true});
            }else{
                res.status(500).send(error);
            };
        });
    }catch(error) {
        console.log(error);
        res.status(500).send(error);
    };
};

//Orders controller
export const getOrders = async(req,res) =>{
    try {
        const orders = await orderModel.find({buyer:req.user._id}).populate('orderItems.product').populate("buyer","name");
        res.status(200).send({orders}); 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Orders",
            error
        }); 
    };
};

//All Orders controller
export const getAllOrders = async(req,res) =>{
    try {
        const orders = await orderModel.find({}).populate("orderItems.product").populate("buyer","name").sort({createAt:"-1"});
        res.status(200).send({orders}); 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get all Orders",
            error
        }); 
    }
};

// Update Order Status
export const orderStatus = async(req,res) =>{
    try {
        const {orderId} = req.params;
        const {status} = req.body;
        console.log(orderId, status);
        const order = await orderModel.findByIdAndUpdate(orderId,{orderStatus:status},{new:true});
        res.status(200).send({order});
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Order Status Update",
            error
        }); 
    }
};

// Single Order
export const singleOrder = async(req,res) =>{
    try {
        const {orderId} = req.params;
        const order = await orderModel.findById(orderId).populate("buyer","name").populate("orderItems.product");
        res.status(200).send({
            success:true,
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Single Order",
            error
        }); 
    };
};
// Delete Order
export const deleteOrder = async(req,res) =>{
    try {
        const {orderId} = req.params;
        await orderModel.findByIdAndDelete(orderId);
        res.status(200).send({
            success:true,
            message:"Order is Deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Order Delete",
            error
        }); 
    }
};
