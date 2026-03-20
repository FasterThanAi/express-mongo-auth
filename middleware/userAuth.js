import jwt from "jsonwebtoken"

const userAuth= async(req,res,next)=>{ // nest-> execute controller func 

    const {token}=req.cookies; // try to find token in cookies 
    if(!token){
        return res.json({success:false, message:'Not Authorized Login again'}) 
    }
    // token available 
    try {
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            req.body.userId=tokenDecode.id
        }
        else{
            return res.json({success:false,message:'Not Authorized Login again'})
        }
        next();
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export default userAuth;