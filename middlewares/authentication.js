import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/errorHandler.js';
import userModel from '../models/userModel.js';

// User Authentication
export const isUser = async(req,res,next)=>{
    try {
        const token = req.headers.authorization;
        if(!token){
            return next(ErrorHandler("Authentication failed! Please login to access this resource",401));
        };

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decodedData.id);
        next();

    } catch (error) {
        next(error);
    };
};


// Admin Authorization
export const isAdmin = async(req, res, next)=>{
    const roles = ["admin"];
    try {
        if(!roles.includes(req.user.role)){
            return next(ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,401));
        };
        next();

    } catch (error) {
        next(error);
    };
};