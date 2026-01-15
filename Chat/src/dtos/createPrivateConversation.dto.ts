export interface PrivateConversationDTO {
    userId: string;
    memberUsername?: string |undefined;
    createdBy?: string;
    memberId?:string | undefined
}
export interface createGroupConversationDTO {
    groupAvatar?:groupAvatarDetails 
    groupName: string;
    memberIds: string[];
    createdBy: string;
    avatarLocalPath:string
}   
export type groupAvatarDetails = {
    url:string,
    publicId:string
}