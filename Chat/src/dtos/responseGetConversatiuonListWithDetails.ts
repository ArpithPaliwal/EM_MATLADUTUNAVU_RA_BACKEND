import type { ConversationBase } from "./responseGetConversationListBase.js";

export type PartnerSummary = {
  _id: string;
  username: string;
  avatar?: string;
};


export type ConversationWithDetails = ConversationBase & {
  partner?: PartnerSummary | undefined;   // only for direct chats
};
