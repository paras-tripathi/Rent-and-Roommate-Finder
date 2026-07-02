import { Router } from 'express';
import {
  getStats,
  getUsers,
  toggleUserActive,
  getAllListings,
  deleteListingAdmin,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserActive);
router.get('/listings', getAllListings);
router.delete('/listings/:id', deleteListingAdmin);

export default router;
