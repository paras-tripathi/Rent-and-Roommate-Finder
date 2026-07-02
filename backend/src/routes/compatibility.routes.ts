import { Router } from 'express';
import { getCompatibility, bulkCompatibility } from '../controllers/compatibility.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Tenant-only: get compatibility score for a listing
router.get('/:listingId', authenticate, authorize('TENANT'), getCompatibility);

// Tenant-only: bulk compute compatibility scores
router.post('/bulk', authenticate, authorize('TENANT'), bulkCompatibility);

export default router;
