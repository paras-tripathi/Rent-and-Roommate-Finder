import { Router } from 'express';
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  markFilled,
  getOwnerListings,
} from '../controllers/listing.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/my', authenticate, authorize('OWNER', 'ADMIN'), getOwnerListings);
router.get('/owner/mine', authenticate, authorize('OWNER', 'ADMIN'), getOwnerListings);
router.get('/:id', getListing);

// Protected routes
router.post('/', authenticate, authorize('OWNER', 'ADMIN'), createListing);
router.put('/:id', authenticate, authorize('OWNER', 'ADMIN'), updateListing);
router.delete('/:id', authenticate, authorize('OWNER', 'ADMIN'), deleteListing);
router.patch('/:id/fill', authenticate, authorize('OWNER'), markFilled);

export default router;
