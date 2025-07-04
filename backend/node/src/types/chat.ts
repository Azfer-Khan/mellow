export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  timestamp: Date;
  user_id: number;
}

export interface Conversation {
  id: number;
  user_message: string;
  ai_response: string;
  timestamp: Date;
  user_id: number;
  username?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
} 