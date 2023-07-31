import mongoose from 'mongoose';

var orderSchema = new mongoose.Schema({
    buyer:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    orderItems:[{
        quantity:{
            type:Number,
            required:true
        },
        product:{
            type:mongoose.Schema.ObjectId,
            ref:"Product",
            required:true
        },
    }],
    shippingInfo:{
        address:{type:String,required:true},
        contact:{type:Number,required:true}
    },
    paymentInfo:{
        id:{type:String,required:true},
        status:{type:String,required:true},
    },
    totalPrice:{type:Number,default:0},
    orderStatus:{
        type:String,
        required:true,
        default:"Processing",
        enum: ["Processing","Shipped","Delivered","Canceled"]
    },
    createdAt:{type:Date,default:Date.now()}
});


export default mongoose.model('Order', orderSchema);