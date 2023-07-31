import express from "express";
import { createUser, deleteUser, forgotPassword, getAllUsers, getSingleUser, getUserDetails, loginUser, logoutUser, resetPassword, updatePassword, updateProfile, updateUserRole } from "../controllers/userController.js";
import { isUser, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

/* ................. USER ROUTES ................. */
router.route('/register').post(createUser);
router.route('/login').post(loginUser);
router.route('/logout').get(isUser, logoutUser);
router.route('/profile').get(isUser, getUserDetails);
router.route('/password/update').put(isUser, updatePassword);
router.route('/me/update').put(isUser, updateProfile);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);


/* ................. ADMIN ROUTES ................. */
router.route('/admin/users').get(isUser, isAdmin, getAllUsers);
router.route('/admin/user/:id')
    .get(isUser, isAdmin, getSingleUser)
    .delete(isUser, isAdmin, deleteUser)
    .put(isUser, isAdmin, updateUserRole);


export default router;