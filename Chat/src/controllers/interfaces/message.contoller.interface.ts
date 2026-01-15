import type { RequestHandler } from 'express';
export interface IMessageControllerInterface {
    sendMessage: RequestHandler;
    getMessages: RequestHandler;
    deleteMessage:RequestHandler;
}
