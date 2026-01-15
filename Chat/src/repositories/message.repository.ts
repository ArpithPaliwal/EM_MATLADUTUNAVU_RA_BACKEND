import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';
import type { IMessageRepository } from '../repositories/interfaces/message.repository.interface.js';
import { Conversation } from '../models/conversation.model.js';
import { ApiError } from '../utils/apiError.js';
export class MessageRepository implements IMessageRepository {
    async createMessage(
        conversationId: string,
        senderId: string,
        text: string,
        imageUrl?: string,
        videoUrl?: string,
        imagePublicId?: string,
        videoPublicId?: string
    ): Promise<any> {
        const messageData: any = {
            conversationId,
            senderId,
            text
        };

        if (imageUrl) {
            messageData.imageUrl = imageUrl;
            messageData.imagePublicId = imagePublicId;
        }

        if (videoUrl) {
            messageData.videoUrl = videoUrl;
            messageData.videoPublicId = videoPublicId;
        }

        return await Message.create(messageData);
    }
    async getMessages(
        conversationId: string,
        userId: string,
        cursor: string | undefined,
        limit: number = 7
    ): Promise<any> {
        const convo = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            members: new mongoose.Types.ObjectId(userId)
        });

        if (!convo) {
            return [];
        }

        const match: any = {
            conversationId: new mongoose.Types.ObjectId(conversationId)
        };

        if (cursor) {
            match._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        const messages = await Message.aggregate([
            {
                $match: match
            },

            { $sort: { _id: -1 } },
            { $limit: limit + 1 }
        ]);
        const hasNext = messages.length > limit;
        if (hasNext) messages.pop();


        return {messages:messages.reverse(),
            nextCursor:hasNext? messages[0]._id : null};
    }
    async deleteMessage(messageId: string, senderId: string): Promise<any> {
  const deletedMessage = await Message.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(messageId),
    senderId: new mongoose.Types.ObjectId(senderId),
  }).lean();

  if (!deletedMessage) {
    throw new ApiError(404, "Message not found or not authorized");
  }

  return deletedMessage;
}

}
