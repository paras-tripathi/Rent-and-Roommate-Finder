import { Router } from 'express';
import {
  upsertTenantProfile,
  getTenantProfile,
  upsertOwnerProfile,
  getOwnerProfile,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Tenant profile routes
router.get('/tenant', authenticate, authorize('TENANT'), getTenantProfile);
router.post('/tenant', authenticate, authorize('TENANT'), upsertTenantProfile);
router.put('/tenant', authenticate, authorize('TENANT'), upsertTenantProfile);

// Owner profile routes
router.get('/owner', authenticate, authorize('OWNER'), getOwnerProfile);
router.post('/owner', authenticate, authorize('OWNER'), upsertOwnerProfile);
router.put('/owner', authenticate, authorize('OWNER'), upsertOwnerProfile);

export default router;
