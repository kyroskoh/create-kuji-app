import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as kujiController from '../controllers/kujiController';
import * as userKujiController from '../controllers/userKujiController';
import * as brandingController from '../controllers/brandingController';

const router = Router();

// User-specific stock endpoint (public - anyone can view)
// GET /api/users/:username/stock
router.get('/:username/stock', kujiController.getUserStock);

// Stock page status (public - for visibility check)
// GET /api/users/:username/stock-status
router.get('/:username/stock-status', userKujiController.getStockPageStatus);

// Data sync endpoints
router.post('/:username/sync-prizes', requireAuth, userKujiController.syncPrizes);
router.post('/:username/sync-settings', requireAuth, userKujiController.syncSettings);
router.post('/:username/sync-history', requireAuth, userKujiController.syncHistory);
router.post('/:username/sync-presets', requireAuth, userKujiController.syncPricingPresets);

// Data retrieval endpoints
router.get('/:username/prizes', requireAuth, userKujiController.getUserPrizes);
router.get('/:username/settings', requireAuth, userKujiController.getUserSettings); // Authenticated - full settings
router.get('/:username/presets', requireAuth, userKujiController.getUserPresets); // Authenticated - pricing presets

// Branding endpoints
router.get('/:username/branding', brandingController.getBranding); // Public endpoint
router.post('/:username/branding/sync', requireAuth, brandingController.syncBranding); // Authenticated
router.delete('/:username/branding', requireAuth, brandingController.deleteBrandingController); // Authenticated

// Session reveal tracking (public endpoints - no auth needed for fans)
router.get('/:username/sessions/:entryId', userKujiController.getFanDrawSession);
router.post('/:username/sessions/:entryId/revealed', userKujiController.markSessionRevealed);
router.get('/:username/sessions/:entryId/revealed', userKujiController.getSessionRevealStatus);

export default router;
