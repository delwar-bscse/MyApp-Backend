import cloudinary from 'cloudinary';
import crypto from 'crypto';

import userModel from '../models/userModel.js';
import getToken from '../utils/jwtToken.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { sendEmail } from '../utils/sendEmail.js';

/* ................. USER ROUTES ................. */
// New User
export const createUser = async(req,res,next)=>{
    try {
        const {name,email,password,avatar} = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(avatar,{
            folder: "avatars",
            width: 150,
            crop: "scale"
        });

        const user = await userModel.create({
            name,
            email,
            password,
            avatar:{
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        });

        res.status(201).json({
            success:true,
            message:"User Created"
        });

    } catch (error) {
        next(error);
    };
};

// Login User
export const loginUser = async(req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return next(ErrorHandler("Please enter Email or Password",400));
        };

        const user = await userModel.findOne({email}).select("+password");
        if(!user){
            return next(ErrorHandler("Invalid Email or Password",401));
        };

        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(ErrorHandler("Invalid Email or Password",401));
        };

        getToken(user,200,res);

    } catch (error) {
        next(error);
    };
};

// Log out User
export const logoutUser = async(req,res,next)=>{
    try {
        // Reset Token when logout and don't send to frontend;
        const user = await userModel.findById(req.user._id);
        await user.get_jwt_token();

        res.status(200).json({
            success: true,
            message: "User Logged Out"
        });

    } catch (error) {
        next(error);
    };
};

// Get User Details
export const getUserDetails = async(req,res,next)=>{
    try {
        const user = req.user;
        res.status(200).json({
            success:true,
            user
        });
    } catch (error) {
        next(error);
    };
};

// Update User Password
export const updatePassword = async(req,res,next)=>{
    try {
        const user = await userModel.findById(req.user._id).select("+password");
        if(!user){
            return next(ErrorHandler("User not found",401));
        };

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
        if(!isPasswordMatched){
            return next(ErrorHandler("Old password is incorrect",400));
        };
        
        if(req.body.newPassword !== req.body.confirmPassword){
            return next(ErrorHandler("New password does not match with Confirm password",400));
        };
        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json({
            success:true,
        });

    } catch (error) {
        next(error);
    };
};

// Update User Profile
export const updateProfile = async(req,res,next)=>{
    try {
        const {name,email,avatar=""} = req.body;
        const newUserData = {name,email};

        if(avatar!==""){
            const user = await userModel.findById(req.user._id);

            const imageId = user.avatar.public_id;
            await cloudinary.v2.uploader.destroy(imageId);

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
                folder: "avatars",
                width: 150,
                crop: "scale"
            });
            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        };

        const user = await userModel.findByIdAndUpdate(req.user._id, newUserData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });

        res.status(200).json({
            success:true,
            user
        });

    } catch (error) {
        next(error);
    };
};

// Forgot Password
export const forgotPassword = async(req,res,next)=>{
    try {
        const user = await userModel.findOne({email:req.body.email});
        if(!user){
            return next(ErrorHandler("User not found",404));
        };

        //get reset password token
        const resetToken = await user.getResetPasswordToken();
        await user.save({validateBeforeSave:false});

        // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/user/password/reset/${resetToken}`;
        const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
        
        const message = `Your password reset token is : \n\n ${resetPasswordUrl}`;
        try {
            
            await sendEmail({
                email:user.email,
                subject:`Password Recovery`,
                message
            });

            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email} successfully`
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({validateBeforeSave:false});
            return next(error);
        }
    } catch (error) {
        next(error);
    };
};

// Reset Password
export const resetPassword = async(req,res,next)=>{
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex"); 

        const user = await userModel.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt: Date.now()}
        });

        if(!user){
            return next(ErrorHandler("Reset password token is invalid or expired",400));
        };

        if(req.body.newPassword !== req.body.confirmPassword){
            return next(ErrorHandler("Password does not match with confirm password",400));
        };

        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success:true,
            message:"Password successfully reset"
        })

    } catch (error) {
        next(error);
    };
};

/* ................. ADMIN ROUTES ................. */
// Get All Users - Admin
export const getAllUsers = async(req,res,next)=>{
    try {
        const users = await userModel.find();
        res.status(200).json({
            success:true,
            users
        });
    } catch (error) {
        next(error);
    };
};

// Get Single User - Admin
export const getSingleUser = async(req,res,next)=>{
    try {
        const user = await userModel.findById(req.params.id);
        res.status(200).json({
            success:true,
            user
        });
    } catch (error) {
        next(error);
    };
};

// Delete User - Admin
export const deleteUser = async(req,res,next)=>{
    try {
        await userModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"User deleted successfully"
        });

    } catch (error) {
        next(error);
    };
};

// Update User Role - Admin
export const updateUserRole = async(req,res,next)=>{
    try {
        const {role} = req.body;
        const user = await userModel.findByIdAndUpdate(req.params.id, {role},{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });

        res.status(200).json({
            success:true,
            user
        });

    } catch (error) {
        next(error);
    };
};