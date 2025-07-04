import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { getPool } from '../config/database';

const router = Router();

// Initialize services and controllers
const pool = getPool();
const userService = new UserService(pool);
const userController = new UserController(userService);

// User routes
router.get('/', 
  authenticateToken(userService), 
  requirePermission('users.read', userService),
  (req, res) => userController.getAllUsers(req, res)
);

router.post('/', 
  authenticateToken(userService), 
  requirePermission('users.create', userService),
  (req, res) => userController.createUser(req, res)
);

router.get('/:id', 
  authenticateToken(userService), 
  requirePermission('users.read', userService),
  (req, res) => userController.getUserById(req, res)
);

router.put('/:id', 
  authenticateToken(userService), 
  requirePermission('users.update', userService),
  (req, res) => userController.updateUser(req, res)
);

router.delete('/:id', 
  authenticateToken(userService), 
  requirePermission('users.delete', userService),
  (req, res) => userController.deactivateUser(req, res)
);

export default router; 