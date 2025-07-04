import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserService } from '../services/userService';
import { authenticateToken } from '../middleware/auth';
import { getPool } from '../config/database';

const router = Router();

// Initialize services and controllers
const pool = getPool();
const userService = new UserService(pool);
const authController = new AuthController(userService);

// Auth routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authenticateToken(userService), (req, res) => authController.me(req, res));

export default router; 