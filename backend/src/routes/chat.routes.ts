import { Router } from 'express';
import { getChatRoom, getMessages, sendMessage, getMyChatRooms } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All chat routes require authentication
router.get('/rooms', authenticate, getMyChatRooms);
router.get('/rooms/:id', authenticate, getChatRoom);
router.get('/rooms/:id/messages', authenticate, getMessages);
router.post('/rooms/:id/messages', authenticate, sendMessage);

export default router;
