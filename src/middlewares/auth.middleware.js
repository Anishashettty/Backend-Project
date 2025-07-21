import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
   try{
    const token= req.cookies?.accessToken   || req.header("Authorization")?.replace("Bearer ","");     
   
   if(!token){
       throw new ApiError(401,"You are not authorized to access this resource, please login first")
   }

   const decodeedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET )

  const user= await User.findById(decodeedToken?._id).select("-password -refreshToken")
    if(!user){
        //NEXT_VIDEO = TODO discuss about frontend
         throw new ApiError(404,"User not found with this token") 
    }
    
    req.user=user;
    next();
   }catch(error){
    throw new ApiError(401, "Invalid token, please login again");
   }
    
})