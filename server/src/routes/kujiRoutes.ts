import { Router } from 'express';
import * as kujiController from '../controllers/kujiController';

const router = Router();

// Public stock endpoint (no authentication required)
router.get('/stock', kujiController.getStock);

export default router;
