import type { RequestHandler } from 'express';

export interface IConversationController {
  createPrivateConversation: RequestHandler;
  createGroupConversation: RequestHandler;
  getUserConversations: RequestHandler;
  updateGroupAvatar:RequestHandler;
  updateGroupName:RequestHandler;
  leaveGroup:RequestHandler;
}
