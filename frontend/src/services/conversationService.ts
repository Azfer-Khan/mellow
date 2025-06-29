import axios from 'axios';
import config from '../config';

export interface ConversationHistory {
  id: number;
  user_message: string;
  ai_response: string;
  timestamp: string;
  user_id: number;
  username: string;
}

export interface ConversationsResponse {
  conversations: ConversationHistory[];
}

export class ConversationService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async fetchConversationHistory(): Promise<ConversationHistory[]> {
    try {
      const response = await axios.get<ConversationsResponse>(
        `${config.apiUrl}/conversations`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data.conversations;
    } catch (error: any) {
      console.error('Error fetching conversation history:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You don\'t have permission to view conversation history.');
      }
      throw new Error('Failed to fetch conversation history');
    }
  }

  static async deleteConversation(conversationId: number): Promise<boolean> {
    try {
      await axios.delete(
        `${config.apiUrl}/conversations/${conversationId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return true;
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
} 