import {asyncHandler} from '../utils/asyncHandler.js';

// const registerUser = asyncHandler(async (req, res) => {
//    res.status(200).json({
//         message: "Ok",
       
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


})

 



export {registerUser};