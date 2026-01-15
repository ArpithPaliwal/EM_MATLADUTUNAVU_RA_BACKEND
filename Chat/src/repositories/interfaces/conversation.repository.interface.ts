import type { createGroupConversationDTO, PrivateConversationDTO } from "../../dtos/createPrivateConversation.dto.js";

export interface IConversationRepository {
    createPrivateConversation(data: PrivateConversationDTO,session:any): Promise<any>;
    checkExistingPrivateConversation(data: PrivateConversationDTO): Promise<any>;
    createGroupConversation(data: createGroupConversationDTO,session:any): Promise<any>;
    getConversationMembers(conversationId: string): Promise<any>;
    getUserConversations(userId: string): Promise<any>;
    updateConversationLastMessage(conversationId: string, messageId: string, messageText: string, senderId: string,createdAt:string): Promise<any>;
    updateGroupAvatar(groupId:string,groupAvatarUrl:string,groupAvatarPublicId:string):Promise<any>
    updatedGroupName(groupId:string,name:string):Promise<any>
    leaveGroup(userId:string,groupId:string):Promise<any>
}