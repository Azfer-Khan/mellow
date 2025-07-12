import { Router } from 'express';
import { IntakeController } from '../controllers/intakeController';
import { IntakeService } from '../services/intakeService';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { UserService } from '../services/userService';
import { getPool } from '../config/database';

const router = Router();

// Initialize services and controllers
const pool = getPool();
const userService = new UserService(pool);
const intakeService = new IntakeService(pool);
const intakeController = new IntakeController(intakeService);

// User intake form routes (authenticated users only)

// Initialize intake form
router.post('/start', 
  authenticateToken(userService),
  (req, res) => intakeController.initializeIntakeForm(req, res)
);

// Get current user's intake form
router.get('/', 
  authenticateToken(userService),
  (req, res) => intakeController.getMyIntakeForm(req, res)
);

// Update intake form (partial updates supported)
router.put('/', 
  authenticateToken(userService),
  (req, res) => intakeController.updateIntakeForm(req, res)
);

// Complete intake form
router.post('/complete', 
  authenticateToken(userService),
  (req, res) => intakeController.completeIntakeForm(req, res)
);

// Get intake progress
router.get('/progress', 
  authenticateToken(userService),
  (req, res) => intakeController.getIntakeProgress(req, res)
);

// Check intake status (used by auth flow)
router.get('/status', 
  authenticateToken(userService),
  (req, res) => intakeController.checkIntakeStatus(req, res)
);

// Validate section data
router.post('/validate', 
  authenticateToken(userService),
  (req, res) => intakeController.validateSection(req, res)
);

// Screening modules routes

// Submit screening module response
router.post('/modules/:type', 
  authenticateToken(userService),
  (req, res) => intakeController.submitScreeningModule(req, res)
);

// Get user's completed screening modules
router.get('/modules', 
  authenticateToken(userService),
  (req, res) => intakeController.getMyScreeningModules(req, res)
);

// Get recommended screening modules for user
router.get('/modules/recommended', 
  authenticateToken(userService),
  (req, res) => intakeController.getRecommendedModules(req, res)
);

// Admin routes (require appropriate permissions)

// Get all intake forms (admin/moderator only)
router.get('/admin/all', 
  authenticateToken(userService),
  requirePermission('users.read', userService),
  (req, res) => intakeController.getAllIntakeForms(req, res)
);

// Get intake form by ID (admin/moderator only)
router.get('/admin/:id', 
  authenticateToken(userService),
  requirePermission('users.read', userService),
  (req, res) => intakeController.getIntakeFormById(req, res)
);

// Delete intake form (admin only)
router.delete('/admin/:id', 
  authenticateToken(userService),
  requirePermission('users.delete', userService),
  (req, res) => intakeController.deleteIntakeForm(req, res)
);

export default router; 