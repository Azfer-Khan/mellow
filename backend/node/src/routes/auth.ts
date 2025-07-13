import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserService } from '../services/userService';
import { IntakeService } from '../services/intakeService';
import { IntakeController } from '../controllers/intakeController';
import { authenticateToken } from '../middleware/auth';
import { getPool } from '../config/database';

const router = Router();

// Initialize services and controllers
const pool = getPool();
const userService = new UserService(pool);
const intakeService = new IntakeService(pool);
const authController = new AuthController(userService);
const intakeController = new IntakeController(intakeService);

// Auth routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authenticateToken(userService), (req, res) => authController.me(req, res));

// Intake status check (used by frontend to determine if user needs to complete intake)
router.get('/intake-status', authenticateToken(userService), (req, res) => intakeController.checkIntakeStatus(req, res));

export default router; 