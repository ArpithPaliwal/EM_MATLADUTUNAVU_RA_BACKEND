export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
