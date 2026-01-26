import mongoose from "mongoose";
import { UserClient } from "../clients/user.client.js";
import type { PrivateConversationDTO, createGroupConversationDTO } from "../dtos/createPrivateConversation.dto.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { IConversationRepository } from "../repositories/interfaces/conversation.repository.interface.js";
import type { IConversationService } from "./interfaces/conversation.service.interface.js";
import type { IConversationParticipantService } from "./interfaces/ConversationParticipant.service.interface.js";
import { ConversationParticipantService } from "./conversationParticipant.service.js";

import { ApiError } from "../utils/apiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import type { ConversationWithDetails } from "../dtos/responseGetConversatiuonListWithDetails.js";
import type { ConversationBase } from "../dtos/responseGetConversationListBase.js";
import type { UserBulkResponse } from "../dtos/userDetailsSummary.dto.js";
import { Conversation } from "../models/conversation.model.js";
function getTheOtherMemberId(members: string[], userId: string) {
    return members.find(m => m.toString() !== userId.toString())!;
}


export class ConversationService implements IConversationService {
    constructor(private conversationrepository: IConversationRepository = new ConversationRepository(),
        private userClient: UserClient = new UserClient(),

        private conversationParticipantService: IConversationParticipantService = new ConversationParticipantService()
    ) { }

    async createPrivateConversation(data: PrivateConversationDTO): Promise<any> {
        const { userId, memberUsername, createdBy } = data;
        console.log("data", data);

        if (!memberUsername) {
            throw new ApiError(400, "Username is required");
        }

        let member;

        try {
            member = await this.userClient.getUserInfoByUsername(memberUsername);
        } catch (error) {
            // user service returned 404 or failed
            throw new ApiError(404, "User does not exist");
        }

        if (!member) {
            throw new ApiError(404, "User does not exist");
        }

        const memberId = member?.id || member?._id;
        const updatedData = {
            ...data,
            memberId
        };

        console.log("up", updatedData);

        const conversationExists =
            await this.conversationrepository.checkExistingPrivateConversation({
                userId,
                memberId,
            });

        if (conversationExists) {
            throw new ApiError(409, "Conversation already exists");
        }

        const session = await mongoose.startSession();
        try {

            session.startTransaction();
            const conversation = await this.conversationrepository.createPrivateConversation(updatedData, session);
            if (conversation) {
                await this.conversationParticipantService.createConversationParticipants({ userIds: [userId, memberId], conversationId: conversation?._id }, session);
            }
            await session.commitTransaction();
            console.log("coversation service last ",conversation);
            
            return conversation;
        } catch (error) {
            await session.abortTransaction();

            throw error;
        }
        finally {
            session.endSession();
        }




    }


    async createGroupConversation(data: createGroupConversationDTO): Promise<any> {
        const { groupName, memberIds, createdBy, avatarLocalPath } = data;
        if (Array.isArray(memberIds) && memberIds.length < 2) {
            throw new ApiError(400, "At least two members are required to create a group conversation");
        }
        if (!memberIds?.length || !groupName || !avatarLocalPath) {
            throw new ApiError(400, "Group name and member ids avatar  required");
        }


        const avatarCloudinaryData = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarCloudinaryData) {
            throw new ApiError(500, "Failed to upload avatar on Cloudinary");
        }


        const groupAvatar = {
            url: avatarCloudinaryData.secure_url,
            publicId: avatarCloudinaryData.public_id,
        };

        data = { ...data, groupAvatar }

        const session = await mongoose.startSession();
        try {

            session.startTransaction();

            const conversation = await this.conversationrepository.createGroupConversation(data, session);
            await this.conversationParticipantService.createConversationParticipants({ userIds: memberIds, conversationId: conversation._id }, session);

            await session.commitTransaction();

            return conversation;
        } catch (error) {
            await deleteFromCloudinary(avatarCloudinaryData?.public_id);
            await session.abortTransaction();



            throw error;
        } finally {

            session.endSession();
        }
    }

    async getConversationMembers(conversationId: string): Promise<any> {
        const members = await this.conversationrepository.getConversationMembers(conversationId);
        return members;
    }

    async getUserConversations(userId: string): Promise<ConversationWithDetails[]> {
        const conversations: ConversationBase[] = await this.conversationrepository.getUserConversations(userId);
        const partnerIds: string[] = conversations
            .filter(c => c.type === "direct")
            .map(c => getTheOtherMemberId(c.members, userId).toString());
        const partnerInfos: UserBulkResponse = await this.userClient.getUserInfoClient(partnerIds);
        console.log(partnerInfos);

        const partnerMap = new Map(
            partnerInfos.users.map((u) => [u._id, u])
        );


        const ConversationsStiched = conversations.map((c) => {
            if (c.type !== "direct") return c;

            const partnerId = getTheOtherMemberId(c.members, userId).toString();

            return partnerId ? {
                ...c,
                partner: partnerMap.get(partnerId),
            } : c;
        });
        console.log("stichd", ConversationsStiched);

        return ConversationsStiched;
    }
    async updateConversationLastMessage(conversationId: string, messageId: string, messageText: string, senderId: string, createdAt: string): Promise<any> {
        const updatedConversation = await this.conversationrepository.updateConversationLastMessage(conversationId, messageId, messageText, senderId, createdAt);
        return updatedConversation;
    }
    async updateGroupAvatar(
        userId: string,
        createdBy: string,
        groupId: string,
        groupAvatarFile: string
    ) {
        if (userId !== createdBy) {
            throw new ApiError(400, "you are not authorized to change the groupAvatar");
        }
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
            throw new Error("Invalid userId or groupId");
        }
        if (!groupAvatarFile) {
            throw new ApiError(400, "failed to upload groupavatar to multer");
        }

        const avatarCloudinaryData = await uploadOnCloudinary(groupAvatarFile);

        if (!avatarCloudinaryData) {
            throw new ApiError(500, "Failed to upload avatar on Cloudinary");
        }

        const groupAvatarurl = avatarCloudinaryData.secure_url;
        const groupAvatarPublicId = avatarCloudinaryData.public_id;

        const { updatedGroup, previousAvatar } =
            await this.conversationrepository.updateGroupAvatar(
                groupId,
                groupAvatarurl,
                groupAvatarPublicId
            );


        if (previousAvatar?.publicId) {
            deleteFromCloudinary(previousAvatar.publicId)
                .catch(err => console.log("Previous avatar delete failed:", err.message));
        }

        return updatedGroup;
    }

    async updateGroupName(userId: string, createdBy: string, groupId: string, name: string): Promise<any> {
        if (userId !== createdBy) {
            throw new ApiError(400, "you are not authorized to change the group name");
        }
        const updateConversation = await this.conversationrepository.updatedGroupName(groupId, name)

        return updateConversation
    }
    async leaveGroup(userId: string, groupId: string): Promise<any> {
        await this.conversationrepository.leaveGroup(userId, groupId)
    }
}

