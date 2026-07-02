import { Router } from 'express';
import { register, login, getMe, updateAvatar } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.patch('/avatar', authenticate, updateAvatar);

export default router;
