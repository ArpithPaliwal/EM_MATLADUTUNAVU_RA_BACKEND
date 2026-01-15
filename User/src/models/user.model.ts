import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password:string;
    avatar:string;
    refreshToken:string;
}

const schema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique:true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type:String,
            required:[true,"password is required"]
        },
        avatar:{
            type:String,
            
            
        },
        refreshToken:{
            type:String,

        }
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User",schema)