import { Router } from 'express';
import { getNotifications, markRead, markOneRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/read-all', authenticate, markRead);
router.patch('/:id/read', authenticate, markOneRead);

export default router;
