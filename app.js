import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import userRouter from './routes/userRoute.js';
import errorMiddleware from './utils/errorMiddleware.js';
import categoryRouter from './routes/categoryRotes.js';
import productRouter from './routes/productRoute.js';
import orderRouter from './routes/orderRoutes.js';


// dotenv.config({path:"./config/config.env"});
dotenv.config();

const app = express();

//middlewares
app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(fileUpload());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
    origin:true,
    credentials:true
}));

//connect routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/category",categoryRouter);
app.use("/api/v1/product",productRouter);
app.use("/api/v1/order",orderRouter);

//Middleware for Errors
app.use(errorMiddleware);


export default app;