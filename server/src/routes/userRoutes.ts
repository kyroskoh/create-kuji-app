import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// Profile management
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.put('/username', userController.updateUsername);

// Password management
router.post('/change-password', userController.changePassword);

// Email management
router.post('/emails', userController.addEmail);
router.delete('/emails/:id', userController.removeEmail);
router.patch('/emails/:id/primary', userController.setPrimaryEmail);
router.post('/emails/:id/resend-verification', userController.resendVerification);

export default router;
