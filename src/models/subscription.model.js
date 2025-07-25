
import mongoose,{Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,//one who sucscribing
        ref: "User",
       
    },
    channel:{
        type: Schema.Types.ObjectId,//channel which is being subscribed
        ref: "User",
       
    }
},{timestamps:true});

export const Subscription=mongoose.model("Subscription", subscriptionSchema);