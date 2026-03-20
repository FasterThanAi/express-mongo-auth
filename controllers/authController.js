import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

export const register =async(req,res)=>{
    
    const {name,email,password}=req.body

    if(!name || !email || !password){
        return res.json({success:false, message: 'Missing Details'})
    }
    try{
        // check the existing user 
        const existingUser=await userModel.find({email})
        if(existingUser){
            return res.json({success:false, message: " User already exists"})
        }



        const hashedPassword=await bcrypt.hash(password,10)
        // created user in database 

        const user= new userModel({name, email,password: hashedPassword})
        await user.save();
        // token generate , create new user 
        const token= jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        // send this token to user in response 
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production', // false
            sameSite:process.env.NODE_ENV==='production' ? 'none': 'strict',
            maxAge:7 * 24 * 60 * 60 * 1000 // 7days expire time for cookies 

        })
    } catch(error){
        res.json({success: false , message:error.message})
    }
}


