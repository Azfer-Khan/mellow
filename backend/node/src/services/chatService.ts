import axios from 'axios';
import { DatabaseService } from './databaseService';
import { ChatMessage, ChatResponse, Conversation } from '../types/chat';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export class ChatService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  async sendMessage(message: string, userId: number): Promise<ChatResponse> {
    try {
      // Call the Python microservice to get an AI response
      const pythonResponse = await axios.post(`${config.pythonAiUrl}/generate-response`, { message });
      const aiResponse = pythonResponse.data.response;

      // Log the conversation into PostgreSQL with user association
      const insertResult = await this.dbService.query(
        'INSERT INTO conversations (user_message, ai_response, user_id) VALUES ($1, $2, $3) RETURNING id, timestamp',
        [message, aiResponse, userId]
      );

      return {
        response: aiResponse,
        conversation_id: insertResult.rows[0].id,
        timestamp: insertResult.rows[0].timestamp,
        user_id: userId
      };
    } catch (error) {
      logger.error('Error in chat service:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async getConversations(limit: number = 50): Promise<Conversation[]> {
    try {
      const result = await this.dbService.query(
        `SELECT c.id, c.user_message, c.ai_response, c.timestamp, c.user_id, u.username 
         FROM conversations c 
         LEFT JOIN users u ON c.user_id = u.id 
         ORDER BY c.timestamp DESC LIMIT $1`,
        [limit]
      );
      
      return result.rows as Conversation[];
    } catch (error) {
      logger.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  async getUserConversations(userId: number, limit: number = 50): Promise<Conversation[]> {
    try {
      const result = await this.dbService.query(
        `SELECT c.id, c.user_message, c.ai_response, c.timestamp, c.user_id, u.username 
         FROM conversations c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.user_id = $1
         ORDER BY c.timestamp DESC LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows as Conversation[];
    } catch (error) {
      logger.error('Error fetching user conversations:', error);
      throw new Error('Failed to fetch user conversations');
    }
  }
} 