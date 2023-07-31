import express from 'express';
import { isAdmin, isUser } from '../middlewares/authentication.js';
import { allCategory, createCategory, deleteCategory, singleCategory, updateCategory } from '../controllers/categoryControllers.js';

const router = express.Router();

//Category Routes//

//Create Category
router.post('/create-category', isUser, isAdmin, createCategory);

//Update Category
router.put('/update-category/:id', isUser, isAdmin, updateCategory);

//Get All Category
router.get('/all-category', allCategory);

//Get single Category
router.get('/single-category/:slug', singleCategory);

//Delete Category
router.delete('/delete-category/:id', isUser, isAdmin, deleteCategory);

export default router;