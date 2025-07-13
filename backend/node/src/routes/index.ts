import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import chatRoutes from './chat';
import healthRoutes from './health';
import intakeRoutes from './intake';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/health', healthRoutes);
router.use('/intake', intakeRoutes);

// Legacy route mappings for backward compatibility
router.use('/conversations', chatRoutes);

export default router; 