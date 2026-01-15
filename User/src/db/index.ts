import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ():Promise<void>=>{
    try {
        console.log("MongoDB URI:", process.env.MONGODB_URI);

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMONGODB CONNECTED SUCCESFULLY !! DB HOST: ${connectionInstance.connection.host}`);
        
        
    } catch (error) {
        console.log("MONGODB NOT CONNECTED , ERROR ",error);
        process.exit(1)
        
    }
}

export  default connectDB