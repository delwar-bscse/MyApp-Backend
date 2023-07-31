import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import validator from 'validator';

var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30, "Name cannot exceed 30 characters"],
        minLength:[4, "Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail, "Please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        minLength:[4, "Password should have more than 4 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            require:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

// JWT TOKEN
userSchema.methods.get_jwt_token = async function(){
    return await jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
};

// HASH PASSWORD
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) next() ;
    this.password = await bcrypt.hash(this.password, 5);
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
};

// GENERATE RESET PASSWORD TOKEN
userSchema.methods.getResetPasswordToken = async function(){
    const resetToken = await crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = await crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10*60*60*1000;
    return resetToken;
};


export default mongoose.model('User', userSchema);