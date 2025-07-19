import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const vedioSchema = new Schema(
    {
        vedioFile: {
            type: String, // Cloudinary URL
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary URL
            required: true
        },
        title:{
            type: String,
            required: true,
            
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, //cloudinary
            required: true,
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
        

    },
    {
        timestampstrue
    }
)
vedioSchema.plugin(mongooseAggregatePaginate);

export const Vedio=mongoose.model("Vedio",vedioSchema);