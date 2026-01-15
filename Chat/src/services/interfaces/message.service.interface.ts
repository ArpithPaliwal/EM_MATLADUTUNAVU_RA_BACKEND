export interface IMessageService {
    createMessage(conversationId: string, senderId: string, text: string, imageOrVideoPath?: string,): Promise<any>;
    getMessages(conversationId: string, userId: string ,cursor?: string|undefined): Promise<any>;
    deleteMessage(messageId: string, senderId: string): Promise<any>
}