import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js'

export const register =async(req,res)=>{
    
    const {name,email,password}=req.body

    if(!name || !email || !password){
        return res.json({success:false, message: 'Missing Details'})
    }
    try{
        // check the existing user 
        const existingUser=await userModel.findOne({email})
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


        });
        // sending welcome email 
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to:email,
            subject:'Welcome, Thanks for Register ',
            text:`so this authentication system built by Priyanshu kumar .
            your account has been created using ${email}`
        }
        await transporter.sendMail(mailOptions) // send the email 
        return res.json({success:true})

    } catch(error){
        res.json({success: false , message:error.message})
    }
}


export const login= async(req,res)=>{
    const{email,password}=req.body;

    if(!email|| !password){
        return res.json({success:false,message:'Email and password are required'})
    }
    try{
        // if user is avialble
        const user=await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:'Invalid email'})
        }

        const isMatch=await bcrypt.compare(password, user.password)
        // suppose user exist in db then check the password 
        if(!isMatch){
            return res.json({success:false, message:'Invalid password '})
        }
        // generate token 
        const token= jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        // send this token to user in response 
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production', // false
            sameSite:process.env.NODE_ENV==='production' ? 'none': 'strict',
            maxAge:7 * 24 * 60 * 60 * 1000 // 7days expire time for cookies 

        });
        return res.json({success:true})
    } catch(error){
        return res.json({success:false,message: error.message})
    }
}


export const logout= async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production', // false
            sameSite:process.env.NODE_ENV==='production' ? 'none': 'strict',
        })

        return res.json({success:true, message: "Logged Out"})
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}
// send verification OTP to user's Email
export const sendVerifyOtp=async(req,res)=>{
    try {
        const {userId}=req.body // how we are getting userid here ? 

        const user=await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:"Account is already verified"})
        }
        // to generate OTP generate 6 digit 
       const otp=String(Math.floor(100000 + Math.random() *900000)) 
       user.verifyOtp=otp;
       user.verifyOtpExpireAt=Date.now() + 24* 60 * 60 * 1000

       await user.save(); //. these property value saved 
       // send email to user of otp 

       const mailOptions={
        from: process.env.SENDER_EMAIL,
        to:user.email,
        subject:'Account Verification OTP ',
        text:`Your otp is ${otp}. verify your account using this OTP`
       }
       await transporter.sendMail(mailOptions)
       res.json({success:true,message:'Verification Sent on Email'})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// verification function usign OTP 
export const verifyEmail= async(req,res)=>{
    const {userId, otp}= req.body; // how we are getting userid here ? 

    if(!userId || !otp){
        return res.json({success:false,message:'Missing Details'})
    }
    try {
        
        const user=await userModel.findById(userId)
        // if user is not found 
        if(!userId){
            return res.json({success:false, message:'User not found'})
        }
        // otp check 
        if( user.verifyOtp===''|| user.verifyOtp!==otp){
            return res.json({success:false,message:'Invalid OTP'})
        }
        // if otp is valid check expiry date
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:'OTP is expired'})
        }

        user.isAccountVerified=true;

        user.verifyOtp=''
        user.verifyOtpExpireAt=0

        await user.save()
        return res.json({success:true,message:'Email is verified successfully'})
        // else
        

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// check user is authenticated 
export const isAuthenticated= async(req,res)=>{
    try {
        return res.json({success:true})
    } catch (error) {
        res.json({success:false,message:message.error})
    }
}

// send password reset otp 
export const sendResetOtp=async(req,res)=>{
    const {email}=req.body
    // check email 
    if(!email){
        return res.json({success:false,message:'Email is required'})
    }
    try {
        // find the user 
        const user=await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:'user is not found'})
        }

       const otp=String(Math.floor(100000 + Math.random() *900000)) 
       user.resetOtp=otp;
       user.resetOtpExpireAt=Date.now() + 1 * 60 * 1000
        
       await user.save()
       const mailOptions={
        from: process.env.SENDER_EMAIL,
        to:user.email,
        subject:'Password Reset OTP ',
        text:`Your otp is ${otp}  for reset the password `
       }

       await transporter.sendMail(mailOptions)

       // 
       return res.json({success:true,message:'OTP sent to your email'})
    } catch (error) {
        res.json({success:false,message:message.error})
    }
}


// reset user password by verifying the OTP 

export const resetPassword= async(req,res)=>{
    const {email,otp,newPassword}=req.body
    if(!email|| !otp|| !newPassword){
        return res.json({success:false, message:'Email , OTP and newPassword is required'})
    }

    try {
        const user=await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:'User not Found'})
        }
        if(user.resetOtp===''|| user.resetOtp!==otp)
            return res.json({success:false,message:'Invalid Otp'})
        // if OTP match 
        if(user.resetOtpExpireAt<Date.now())
            return res.json({success:false,message:'Otp is Expired'})

        // encrypt pass 
        const hashedPassword= await bcrypt.hash(newPassword,10)
        user.password=hashedPassword
        user.resetOtp=''
        user.resetOtpExpireAt=0;
        await user.save()

        return res.json({success:true,message:'Password has been reset Successfully'})
        
    } catch (error) {
        res.json({success:false,message:message.error})
    }
}