export type GroupAvatar = {
  url: string;
  publicId?: string;
};

export type ConversationBase = {
  _id: string;

  conversationId?: string;     // in your output, equals _id
  userId: string;              // from participant merge
  unreadCount: number;
  conversationParticipantId:string
  type: "direct" | "group";

  members: string[];
  createdBy: string;

  groupName?: string;
  groupAvatar?: GroupAvatar;   // optional

  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;
};
