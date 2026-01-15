import type { Request, Response } from "express";
import type { IConversationController } from "./interfaces/conversation.controller.interface.js";
import type { IConversationService } from "../services/interfaces/conversation.service.interface.js";
import { ConversationService } from "../services/conversation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import fs from "fs";

export class ConversationController implements IConversationController {
  constructor(private conversationService: IConversationService = new ConversationService()) { }

  createPrivateConversation = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { memberUsername } = req.body;
    const userId = req.user?._id
    console.log("USER ID FROM REQ.USER:", userId);
    const conversation = await this.conversationService.createPrivateConversation({ memberUsername, userId, createdBy: userId });
    return res.status(201).json(new ApiResponse(201, conversation, "Private conversation created successfully"));
  })
  
  // createGroupConversation = asyncHandler(async (req: Request, res: Response) => {
  //   const { groupName } = req.body;

  //   const createdBy = req.user?._id;
  //   const avatarLocalPath = req.file?.path;
  //   if (!avatarLocalPath) throw new ApiError(404, "no avatar found ")
  //   const rawMemberIds = req.body.memberIds;

  //   if (!rawMemberIds) {
  //     return res.status(400).json(new ApiResponse(400, null, "memberIds missing"));
  //   }

  //   let parsedMemberIds: string[];

  //   try {
  //     const temp = typeof rawMemberIds === "string"
  //       ? JSON.parse(rawMemberIds)
  //       : rawMemberIds;

  //     parsedMemberIds = Array.isArray(temp) ? temp : [temp];
  //     if (req.user?._id) {
  //       parsedMemberIds.push(req.user._id.toString());
  //     }
  //   } catch (err) {
  //     return res.status(400).json(new ApiResponse(400, null, "Invalid memberIds format"));
  //   }

  //   const conversation =
  //     await this.conversationService.createGroupConversation({
  //       groupName,
  //       memberIds: parsedMemberIds,
  //       createdBy,
  //       avatarLocalPath,
  //     });
  //   console.log("group convo", conversation);

  //   return res.status(201).json(
  //     new ApiResponse(201, conversation, "Group conversation created successfully")
  //   );
  // });
createGroupConversation = asyncHandler(async (req: Request, res: Response) => {
  const { groupName } = req.body;
  const createdBy = req.user?._id;

  const avatarLocalPath = req.file?.path;

  try {
    if (!avatarLocalPath) throw new ApiError(404, "no avatar found");

    const rawMemberIds = req.body.memberIds;

    if (!rawMemberIds) {
      throw new ApiError(400, "memberIds missing");
    }

    let parsedMemberIds: string[];

    try {
      const temp =
        typeof rawMemberIds === "string"
          ? JSON.parse(rawMemberIds)
          : rawMemberIds;

      parsedMemberIds = Array.isArray(temp) ? temp : [temp];

      if (req.user?._id) {
        parsedMemberIds.push(req.user._id.toString());
      }
    } catch {
      throw new ApiError(400, "Invalid memberIds format");
    }

    const conversation =
      await this.conversationService.createGroupConversation({
        groupName,
        memberIds: parsedMemberIds,
        createdBy,
        avatarLocalPath,
      });

    return res.status(201).json(
      new ApiResponse(201, conversation, "Group conversation created successfully")
    );

  } catch (error) {

    
    if (avatarLocalPath) {
      try {
        await fs.promises.unlink(avatarLocalPath);
      } catch {}
    }

    throw error;
  }
});


  getUserConversations = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;
    const conversations = await this.conversationService.getUserConversations(userId);
    console.log(conversations);

    return res.status(200).json(new ApiResponse(200, conversations, "User conversations retrieved successfully"));
  })
updateGroupAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { groupId } = req.params;
  const { createdBy } = req.body;

  const groupAvatarFile = req.file?.path;

  try {
    if (!groupId) throw new ApiError(400, "No group id found");
    if (!groupAvatarFile) throw new ApiError(400, "No avatar found");

    const updatedConversation =
      await this.conversationService.updateGroupAvatar(
        userId,
        createdBy,
        groupId,
        groupAvatarFile
      );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedConversation, "Group avatar updated"));

  } catch (error) {

    
    if (groupAvatarFile) {
      try {
        await fs.promises.unlink(groupAvatarFile);
      } catch {}
    }

    throw error;
  }
});

updateGroupName = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { groupId } = req.params;

    
    const {createdBy,name} = req.body
    if (!groupId) throw new ApiError(400, "No group id found");
    

    const updatedConversation =
      await this.conversationService.updateGroupName(
        userId,
        createdBy,
        groupId,
        name
      );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedConversation, "Group avatar updated"));
  });
  leaveGroup = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { groupId } = req.params;

    
    
    if (!groupId) throw new ApiError(400, "No group id found");
    

    const updatedConversation =
      await this.conversationService.leaveGroup(
        userId,
        
        groupId,
        
      );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Group left"));
  });
}