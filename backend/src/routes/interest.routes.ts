import { Router } from 'express';
import {
  sendInterest,
  respondToInterest,
  getMyInterests,
  withdrawInterest,
} from '../controllers/interest.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Tenant: send interest in a listing
router.post('/', authenticate, authorize('TENANT'), sendInterest);

// Tenant: get my interests
router.get('/mine', authenticate, authorize('TENANT'), getMyInterests);

// Tenant: withdraw interest
router.delete('/:id', authenticate, authorize('TENANT'), withdrawInterest);

// Owner: respond to interest (accept/decline)
router.patch('/:id/respond', authenticate, authorize('OWNER'), respondToInterest);

export default router;
