import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { UserService } from '../services/userService';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { getPool } from '../config/database';

const router = Router();

// Initialize services and controllers
const pool = getPool();
const userService = new UserService(pool);
const chatController = new ChatController();

// Chat routes
router.post('/', 
  authenticateToken(userService), 
  requirePermission('chat.create', userService),
  (req, res) => chatController.sendMessage(req, res)
);

router.get('/conversations', 
  authenticateToken(userService), 
  requirePermission('chat.read', userService),
  (req, res) => chatController.getConversations(req, res)
);

router.get('/conversations/my', 
  authenticateToken(userService), 
  (req, res) => chatController.getUserConversations(req, res)
);

export default router; 