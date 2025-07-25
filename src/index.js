// require('dotenv').config({ path: './env' });
import dotenv from "dotenv";
import {app} from './app.js';

dotenv.config({ 
    path: "./env" 
});



import connectDB from "./db/index.js";


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log("MONGODB connection failed:", err);
});






//  import express  from "express"

// const app = express();


// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/{DB_NAME}` )
//         app.on("error", (error) => {
//             console.error("Server error:", error);
//             throw error
//         })

//         app.listen(process.env.PORT , () => {
//             console.log(`Server is running on port ${process.env.PORT }`);
//         });
           
//     }catch(error){
//         console.log("Error connecting to MongoDB:", error);
//         throw error
//     }
// })()