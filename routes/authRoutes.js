import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter= express.Router();

authRouter.post('/register',register ) // controller func register
authRouter.post('/login',login ) // controller func login
authRouter.post('/logout',logout ) // controller func logout
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
authRouter.post('/verify-account',userAuth,verifyEmail)
authRouter.post('/is-auth',userAuth,isAuthenticated)
authRouter.post('/sent-reset-otp',sendResetOtp)
authRouter.post('/reset-password',resetPassword)

export default authRouter