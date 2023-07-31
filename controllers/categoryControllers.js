import slugify from "slugify";
import { ErrorHandler } from "../utils/errorHandler.js";
import categoryModel from "../models/categoryModel.js";


//Create Category
export const createCategory = async(req, res, next) =>{
    try {
        const {name} = req.body;
        if(!name){
            return next(ErrorHandler('Name is required',400));
        };

        const existingCategory = await categoryModel.findOne({name});
        if(existingCategory){
            return next(ErrorHandler('Category already exist',400));
        };
        
        await new categoryModel({name, slug:slugify(name)}).save();

        return res.status(201).send({
            success:true,
            message:'Category is created'
        });
    } catch (error) {
        next(error);
    };
};

//Update Category
export const updateCategory = async(req, res, next) =>{
    try {
        const {name} = req.body;
        const {id} = req.params;

        if(!name){
            return next(ErrorHandler('Name is required',400));
        };
        
        await categoryModel.findByIdAndUpdate(id, {name, slug:slugify(name)},{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        
        return res.status(200).send({
            success:true,
            message:'Category is updated'
        });
    } catch (error) {
        next(error);
    };
};

//Get All Category
export const allCategory = async(req, res, next) =>{
    try {
        const categories = await categoryModel.find({});
        return res.status(200).send({
            success:true,
            message:'All Category',
            categories
        });
    } catch (error) {
        next(error);
    };
};

//Get single Category
export const singleCategory = async(req, res, next) =>{
    try {
        const category = await categoryModel.findOne({slug:req.params.slug});
        return res.status(200).send({
            success:true,
            message:'Single Category',
            category
        });
    } catch (error) {
        next(error);
    };
};

//Delete Category
export const deleteCategory = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const category = await categoryModel.findByIdAndDelete(id);
        return res.status(200).send({
            success:true,
            message:'Deleted Category',
            category
        });
    } catch (error) {
        next(error);
    };
};