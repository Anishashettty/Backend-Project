import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';




    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUDINARY_API, 
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath) return null
            //upload the file on cloudinary
            const response=await cloudinary.uploader.upload(localFilePath,{
                resource_type: "auto",
            })
           //file has been uploaded successfully
           console.log("file is uploaded on cloudinary", response.url);
           return response;

        }catch(error){
            fs.unlinkSync(localFilePath); // Clean up the local saved temporary file(delete from the server )
           return  null; // Return null if there is an error
        }
    }
    
    export { uploadOnCloudinary };
// Export the upload function