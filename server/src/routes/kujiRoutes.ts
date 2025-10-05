import { Router } from 'express';
import * as kujiController from '../controllers/kujiController';

const router = Router();

// Public routes
router.get('/stock', kujiController.getStock);

export default router;
