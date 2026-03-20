import express from 'express'
import { login, logout, register } from '../controllers/authController.js';

const authRouter= express.Router();

authRouter.post('/register',register ) // controller func register
authRouter.post('/login',login ) // controller func login
authRouter.post('/login',logout ) // controller func logout

export default authRouter