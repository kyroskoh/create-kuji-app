import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and super admin privileges
router.use(requireAuth, requireSuperAdmin);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// User session management
router.post('/users/:id/revoke-sessions', adminController.revokeUserSessions);

// Statistics
router.get('/stats', adminController.getStats);

export default router;
