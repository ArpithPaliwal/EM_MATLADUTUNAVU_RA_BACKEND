import type { IMessageService } from "./interfaces/message.service.interface.js";
import type { IMessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

import type { IConversationService } from "./interfaces/conversation.service.interface.js";
import { ConversationService } from "./conversation.service.js";
import type { MessageResponseDto } from "../dtos/message.dto.js";
import { ApiError } from "../utils/apiError.js";

export class MessageService implements IMessageService {
    constructor(private messageRepository: IMessageRepository = new MessageRepository(), private conversationService: IConversationService = new ConversationService()) { }
    async createMessage(conversationId: string, senderId: string, text: string, imageOrVideoPath?: string): Promise<any> {
        // Implementation for creating a message
        if (!senderId || !conversationId) {
            throw new Error("Invalid sender or conversation");
        }
        if (!text && !imageOrVideoPath) {
            throw new Error("Message content cannot be empty");
        }

        const messageData: any = {
            conversationId,
            senderId,
            text
        };

        if (imageOrVideoPath) {
            const cloudinaryData = await uploadOnCloudinary(imageOrVideoPath);

            if (cloudinaryData?.resource_type === "image") {
                messageData.imageUrl = cloudinaryData.secure_url;
                messageData.imagePublicId = cloudinaryData.public_id;
            }

            if (cloudinaryData?.resource_type === "video") {
                messageData.videoUrl = cloudinaryData.secure_url;
                messageData.videoPublicId = cloudinaryData.public_id;
            }
        }
        const message = await this.messageRepository.createMessage(messageData.conversationId, messageData.senderId, messageData.text, messageData.imageUrl, messageData.videoUrl, messageData.imagePublicId, messageData.videoPublicId);
        await this.conversationService.updateConversationLastMessage(conversationId, message._id, text, senderId, message.createdAt);


        return message;
    }
    async getMessages(
        conversationId: string,
        userId: string,
        cursor?: string
    ): Promise<{ messages: MessageResponseDto[]; nextCursor: string | null }> {

        if (!conversationId || !userId) {
            throw new Error("Invalid conversation or user");
        }

        return await this.messageRepository.getMessages(
            conversationId,
            userId,
            cursor
        );
    }
    async deleteMessage(messageId: string, senderId: string): Promise<any> {
        const messageDetails = await this.messageRepository.deleteMessage(
            messageId,
            senderId
        );

        if (!messageDetails) {
            throw new ApiError(404, "Message not found");
        }

        try {
            if (messageDetails.imagePublicId) {
                await deleteFromCloudinary(messageDetails.imagePublicId);
            }

            if (messageDetails.videoPublicId) {
                await deleteFromCloudinary(messageDetails.videoPublicId);
            }
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }

        return messageDetails;
    }

}