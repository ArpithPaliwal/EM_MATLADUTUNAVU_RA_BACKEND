export interface IMessageRepository {
    createMessage(conversationId: string, senderId: string, text?: string , imageUrl?: string , videoUrl?: string, imagePublicId?: string, videoPublicId?: string): Promise<any>;
    getMessages(conversationId: string, userId: string,cursor?:string | undefined,limit?:number): Promise<any>;
    deleteMessage(messageId:string , senderId:string):Promise<any>
}