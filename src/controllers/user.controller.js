import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// const registerUser = asyncHandler(async (req, res) => {
//    res.status(200).json({
//         message: "chai aur code",
       
//     });
// })


const registerUser=asyncHandler(async(req,res)=>{
    //get user detail fom frontend (postman through we are getting detail)
    //validation - Not Empty
    // check if user already exits:username and email
    //check for images ,check for avatar 
    //upload them to cloudinary-url,avatar
    //create a user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return the user - if successfully created
    const {fullname, username, email, password} = req.body;
    console.log("email:",email)

    if(
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required");
    }

//check user is already exit or nhgfdzot 
   const existedUser= User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists with this username or email");
    }


    //cover image and avatar are required
   const avatarLocalPath= req.files?.avatar[0]?.path;
   const coverImageLocalPath= req.files?.coverImage[0]?.path;
    console.log("avatarLocalPath:",avatarLocalPath)
    console.log("coverImageLocalPath:",coverImageLocalPath)

    if (!avatarLocalPath ){
        throw new ApiError(400, "Avatar  are required");
    }

    //cloudinary upload
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    console.log("avatar:",avatar)
    console.log("coverImage:",coverImage)

    if(!avatar ){
        throw new ApiError(500, "Error while uploading image to cloudinary");
    }

    //create a user object - create entry in db
    const user=await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
    })


    //remove password and refresh token field from response
   const createdUser=await User.findById(user._id).select(
    "-password  -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Error while creating user");
   }

   //return the user - if successfully created
     return res.status(201).json(
        new ApiResponse(200, createdUser, "User created or registered successfully")
     )
   


  

})



export {
    registerUser,
}