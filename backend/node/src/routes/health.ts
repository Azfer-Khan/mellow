import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();
const healthController = new HealthController();

// Health route
router.get('/', (req, res) => healthController.checkHealth(req, res));

export default router; 