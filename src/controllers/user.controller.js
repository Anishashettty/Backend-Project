import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndREfreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //save refresh token in db
    user.refreshToken = refreshToken;
    await user.save({ ValidityBeforeSave: false }); // to avoid pre-save hook execution

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user detail fom frontend (postman through we are getting detail)
  //validation - Not Empty
  // check if user already exits:username and email
  //check for images ,check for avatar
  //upload them to cloudinary-url,avatar
  //create a user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return the user - if successfully created
  const { fullname, username, email, password } = req.body;
  // console.log("email:",email)

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check user is already exit or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists with this username or email");
  }

  //cover image and avatar are required
  const avatarLocalPath = req.files?.avatar[0]?.path;

  //const coverImageLocalPath= req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // console.log("avatarLocalPath:",avatarLocalPath)
  // console.log("coverImageLocalPath:",coverImageLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar  are required");
  }

  //cloudinary upload
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log("avatar:",avatar)
  // console.log("coverImage:",coverImage)

  if (!avatar) {
    throw new ApiError(500, "Error while uploading image to cloudinary");
  }

  //create a user object - create entry in db
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while creating user");
  }

  //return the user - if successfully created
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User created or registered successfully"
      )
    );
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  // username and email
  // find the user
  // password check
  // if password is correct then create jwt         token-access and refersh token generation
  // send cookies
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required for login");
  }

  //user exit is or not using mail or username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found with this username or email");
  }

  // password credentials check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials, password is incorrect");
  }

  const { refreshToken, accessToken } = await generateAccessAndREfreshTokens(
    user._id
  );
  // console.log("Access Token:", accessToken);
  // console.log("Refresh Token:", refreshToken);

  //send cookies
  const loggedUser = await User.findByIdAndUpdate(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //modifiy  by server only ,cannot by frontend
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//logout of user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined, //remove refresh token from db
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//refreshing the access token using refresh token
const refershAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookie.refreshToken || req.body;
    if (!incomingRefreshToken) {
      //check it is !
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(
        401,
        "unauthorized request ,REFERSH TOKEN expires or invalid"
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndREfreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
            newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      "Unauthorized request, invalid or expired refresh token",
      error?.message
    );
  }
});

//modify the password 
const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }

   user.password=newPassword
   await user.save({ValidityBeforeSave:false})
   return res
   .status(200)
   .json(new ApiResponse(200),{},"password changed successfully")


})

//current user
const getCurrentuser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfully")
})

//update the profile
const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body

  if(!fullname ||!email){
    throw new ApiError(400,"All the fields are required")
  }
  const user=User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email,

      }
    },
    {new:true}
  
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully"))

})

//updatioin of avatar file 
const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
 const avatar= await uploadOnCloudinary(avatarLocalPath)
  
   if(!avatar.url){
    throw new ApiError(400, "Error while uploading on avatar");
   }

   const user=await user.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
    new ApiResponse(200,"Avatar image is updated successfully")
   )
   

}) 

//update coverImage 
const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is file is missing or required");
  }
 const coverImage= await uploadOnCloudinary(coverImageLocalPath)
  
   if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on coverImage");
   }

   await user.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}
   ).select("-password")
   return res
   .status(200)
   .json(
    new ApiResponse(200,"Cover image is updated successfully")
   )

}) 
export {
   registerUser,
   loginUser, 
   logoutUser,
    refershAccessToken,
    getCurrentuser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
  };
