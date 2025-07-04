import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { ChatMessage } from '../types/chat';
import { ChatService } from '../services/chatService';
import { logger } from '../utils/logger';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message }: ChatMessage = req.body;
      
      if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const chatResponse = await this.chatService.sendMessage(message, req.user!.id);
      res.json(chatResponse);
    } catch (error) {
      logger.error('Error in sendMessage:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const conversations = await this.chatService.getConversations();
      res.json({ conversations });
    } catch (error) {
      logger.error('Error in getConversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  async getUserConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const conversations = await this.chatService.getUserConversations(userId, limit);
      res.json({ conversations });
    } catch (error) {
      logger.error('Error in getUserConversations:', error);
      res.status(500).json({ error: 'Failed to fetch user conversations' });
    }
  }
} 