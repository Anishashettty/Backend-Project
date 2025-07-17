
// This utility function is used to handle asynchronous operations in Express.js routes.
// It wraps the request handler and catches any errors that occur, passing them to the next middleware.
 

const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
    }
}

export {  asyncHandler}

//-------------try and catch method------
// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({ message: error.message || "Internal Server Error" });
//         console.error("Error in asyncHandler:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }