import { Types } from "mongoose";



export interface GroupAvatar {
  url: string;
  publicId: string;
}

export interface IConversation  {
  

  type: "direct" | "group";

  members: Types.ObjectId[];     
  createdBy: Types.ObjectId;


  groupName?: string;
  groupAvatar?: GroupAvatar;

  lastMessageId?: Types.ObjectId;
  lastMessageText?: string;
  lastMessageSenderId?: Types.ObjectId;
  lastMessageAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
