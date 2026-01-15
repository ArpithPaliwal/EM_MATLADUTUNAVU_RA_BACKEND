import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import type { IMessageControllerInterface } from "./interfaces/message.contoller.interface.js";
import type { IMessageService } from "../services/interfaces/message.service.interface.js";
import { MessageService } from "../services/message.service.js";
import { emitMessageEvents } from "../sockets/events/message.events.js";
import { getIO } from "../sockets/socket.server.js";
import fs from "fs"
import { ApiError } from "../utils/apiError.js";

export class MessageController implements IMessageControllerInterface {
    constructor(private messageService: IMessageService = new MessageService()) { }
    sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { conversationId, text } = req.body;
        const senderId = req.user?._id;
        const ImageOrVideoPath = req.file?.path || "";

        try {
            if (!conversationId || !senderId || (!text && !ImageOrVideoPath)) {
                throw new ApiError(400, "Missing required fields");
            }

            const message = await this.messageService.createMessage(
                conversationId,
                senderId,
                text || "",
                ImageOrVideoPath
            );

            emitMessageEvents(getIO(), message);

            res.status(201).json(
                new ApiResponse(201, message, "Message sent successfully")
            );

        } catch (error) {


            if (ImageOrVideoPath) {
                try {
                    await fs.promises.unlink(ImageOrVideoPath);
                } catch { }
            }

            throw error;
        }
    });


    getMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { conversationId } = req.params;
        const { cursor } = req.query;
        const userId = req.user?._id;

        if (!conversationId || !userId) {
            res.status(400).json(
                new ApiResponse(400, null, "Missing required fields")
            );
            return;
        }

        const data = await this.messageService.getMessages(
            conversationId,
            userId,
            cursor as string | undefined
        );

        res.status(200).json(
            new ApiResponse(200, data, "Messages retrieved successfully")
        );
    });
    deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { messageId } = req.params;

        const userId = req.user?._id;

        if (!messageId || !userId) {
            res.status(400).json(
                new ApiResponse(400, null, "Missing required fields")
            );
            return;
        }

        const data = await this.messageService.deleteMessage(
            messageId,
            userId,

        );

        res.status(200).json(
            new ApiResponse(200, data, "Messages deleted successfully")
        );
    });


}

