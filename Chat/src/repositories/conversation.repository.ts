import type { ClientSession } from "mongoose";
import type { createGroupConversationDTO, PrivateConversationDTO } from "../dtos/createPrivateConversation.dto.js";
import { Conversation } from "../models/conversation.model.js";
import type { IConversationRepository } from "./interfaces/conversation.repository.interface.js";
import mongoose from "mongoose";

export class ConversationRepository implements IConversationRepository {
  async createPrivateConversation(data: PrivateConversationDTO, session: ClientSession): Promise<any> {
    const { userId, memberId, createdBy } = data;
    console.log("REPO RECEIVED DATA:", data);
    const createConversation: any = {
      type: "direct",
      members: [userId, memberId],
      createdBy,
    }
    const [conversation] = await Conversation.create([createConversation], { session });
    return conversation;
  }
  async checkExistingPrivateConversation(data: PrivateConversationDTO): Promise<any> {
    const { userId, memberId } = data;
    return await Conversation.findOne({
      type: "direct",
      members: { $all: [userId, memberId], $size: 2 },
    })
  }
  async createGroupConversation(data: any, session: ClientSession): Promise<any> {
    const { groupName, memberIds, createdBy, groupAvatar } = data;

    const createConversation: any = {
      type: "group",
      groupName,
      members: memberIds,
      createdBy,
      groupAvatar
    }
    const [conversation] = await Conversation.create([createConversation], { session });
    return conversation
  }
  async getConversationMembers(conversationId: string): Promise<any> {
    const conversation = await Conversation.findById(conversationId).select("members");
    return conversation ? conversation.members : null;
  }
  // async getUserConversations(userId: string): Promise<any> {
  //     const convo = await Conversation.aggregate([

  //         { $match: { members: new mongoose.Types.ObjectId(userId) } },


  //         {
  //             $lookup: {
  //                 from: "conversationparticipants",
  //                 let: { convId: "$_id" },
  //                 pipeline: [
  //                     {
  //                         $match: {
  //                             $expr: {
  //                                 $and: [
  //                                     { $eq: ["$conversationId", "$$convId"] },
  //                                     { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] }
  //                                 ]
  //                             }
  //                         }
  //                     }
  //                 ],
  //                 as: "participant"
  //             }
  //         },


  //         {
  //             $set: {
  //                 participant: { $first: "$participant" }
  //             }
  //         },
  //         {
  //             $addFields: {
  //                 conversationParticipantId: "$participant._id"
  //             }
  //         },
  //         {
  //             $replaceRoot: {
  //                 newRoot: {
  //                     $mergeObjects: ["$participant", "$$ROOT"]
  //                 }
  //             }
  //         },
  //         { $project: { participant: 0 } }



  //     ]);




  //     return convo;
  // }
  //     async getUserConversations(userId: string): Promise<any> {
  //   const convo = await Conversation.aggregate([
  //     // 1️⃣ user is member
  //     {
  //       $match: {
  //         members: new mongoose.Types.ObjectId(userId),
  //       },
  //     },

  //     // 2️⃣ join conversation participant
  //     {
  //       $lookup: {
  //         from: "conversationparticipants",
  //         let: { convId: "$_id" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $and: [
  //                   { $eq: ["$conversationId", "$$convId"] },
  //                   { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
  //                 ],
  //               },
  //             },
  //           },
  //         ],
  //         as: "participant",
  //       },
  //     },

  //     // 3️⃣ flatten participant
  //     {
  //       $set: {
  //         participant: { $first: "$participant" },
  //       },
  //     },

  //     // 4️⃣ get latest message of conversation
  //     {
  //       $lookup: {
  //         from: "messages",
  //         let: { convId: "$_id" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: { $eq: ["$conversationId", "$$convId"] },
  //             },
  //           },
  //           { $sort: { _id: -1 } },
  //           { $limit: 1 },
  //         ],
  //         as: "latestMessage",
  //       },
  //     },

  //     // 5️⃣ flatten latest message
  //     {
  //       $set: {
  //         latestMessage: { $first: "$latestMessage" },
  //       },
  //     },

  //     // 6️⃣ compute unread count
  //     {
  //       $addFields: {
  //         unreadCount: {
  //           $cond: [
  //             // if no lastReadMessageId OR no latestMessage
  //             {
  //               $or: [
  //                 { $not: ["$participant.lastReadMessageId"] },
  //                 { $not: ["$latestMessage._id"] },
  //               ],
  //             },
  //             // then unread = total messages count
  //             {
  //               $size: {
  //                 $filter: {
  //                   input: "$$ROOT", // placeholder, replaced below
  //                   cond: false,
  //                 },
  //               },
  //             },
  //             // else compute unread properly
  //             {
  //               $cond: [
  //                 // if lastRead >= latestMessage → 0
  //                 {
  //                   $gte: [
  //                     "$participant.lastReadMessageId",
  //                     "$latestMessage._id",
  //                   ],
  //                 },
  //                 0,
  //                 // else count messages after lastRead
  //                 {
  //                   $size: {
  //                     $filter: {
  //                       input: {
  //                         $map: {
  //                           input: [],
  //                           as: "x",
  //                           in: "$$x",
  //                         },
  //                       },
  //                       cond: false,
  //                     },
  //                   },
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     },

  //     // 7️⃣ REPLACE unread logic with real counting
  //     {
  //       $lookup: {
  //         from: "messages",
  //         let: {
  //           convId: "$_id",
  //           lastRead: "$participant.lastReadMessageId",
  //         },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $and: [
  //                   { $eq: ["$conversationId", "$$convId"] },
  //                   { $gt: ["$_id", "$$lastRead"] },
  //                 ],
  //               },
  //             },
  //           },
  //           { $count: "count" },
  //         ],
  //         as: "unreadAgg",
  //       },
  //     },

  //     // 8️⃣ finalize unreadCount
  //     {
  //       $set: {
  //         unreadCount: {
  //           $ifNull: [{ $first: "$unreadAgg.count" }, 0],
  //         },
  //       },
  //     },

  //     // 9️⃣ clean up
  //     {
  //       $project: {
  //         participant: 0,
  //         unreadAgg: 0,
  //       },
  //     },
  //   ]);

  //   return convo;
  // }
  async getUserConversations(userId: string): Promise<any> {
    const convo = await Conversation.aggregate([
      {
        $match: {
          members: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "conversationparticipants",
          let: { convId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$convId"] },
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: "participant",
        },
      },

      { $set: { participant: { $first: "$participant" } } },

      {
        $lookup: {
          from: "messages",
          let: { convId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$conversationId", "$$convId"] } } },
            { $sort: { _id: -1 } },
            { $limit: 1 },
          ],
          as: "latestMessage",
        },
      },

      { $set: { latestMessage: { $first: "$latestMessage" } } },

      {
        $lookup: {
          from: "messages",
          let: {
            convId: "$_id",
            lastRead: "$participant.lastReadMessageId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$convId"] },
                    { $gt: ["$_id", "$$lastRead"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unreadAgg",
        },
      },

      {
        $set: {
          unreadCount: { $ifNull: [{ $first: "$unreadAgg.count" }, 0] },
        },
      },

      {
        $project: {
          participant: 0,
          unreadAgg: 0,
        },
      },
    ]);

    return convo;
  }

  async updateConversationLastMessage(conversationId: string, messageId: string, messageText: string, senderId: string, createdAt: string): Promise<any> {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId, {
      lastMessageId: messageId,
      lastMessageText: messageText,
      lastMessageSenderId: senderId,
      lastMessageCreatedAt: createdAt
    },
      { new: true }
    );
    return updatedConversation;
    }
    async updateGroupAvatar(groupId: string, groupAvatarUrl: string, groupAvatarPublic: string) {
  const existingGroup = await Conversation.findById(groupId);

  
  if (!existingGroup) {
    throw new Error("Group not found");
  }

  const previousAvatar = existingGroup.groupAvatar;

  const updatedGroup = await Conversation.findByIdAndUpdate(
    groupId,
    {
      groupAvatar: {
        url: groupAvatarUrl,
        publicId: groupAvatarPublic,
      },
    },
    { new: true }
  );

  return { updatedGroup, previousAvatar };
}
async updatedGroupName(groupId: string, name: string): Promise<any> {
  const updatedConversation = await Conversation.findByIdAndUpdate(groupId, {
    groupName:name
  },{new :true})

  return updatedConversation
}

async leaveGroup(userId: string, groupId: string): Promise<any> {

 
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
    throw new Error("Invalid userId or groupId");
  }

 
  const group = await Conversation.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  
  if (group.type !== "group") {
    throw new Error("This conversation is not a group");
  }

 
  const isMember = group.members.some(
    (m) => m.toString() === userId
  );

  if (!isMember) {
    throw new Error("User is not a member of this group");
  }

 
  if (group.createdBy.toString() === userId) {
    throw new Error("Group creator cannot leave the group");
  }

  const updatedGroup = await Conversation.findByIdAndUpdate(
    groupId,
    { $pull: { members: userId } },
    { new: true }
  );


  if (!updatedGroup) {
    throw new Error("Failed to leave group");
  }


  if (updatedGroup.members.length === 0) {
    await Conversation.findByIdAndDelete(groupId);
  }

  return updatedGroup;
}

}