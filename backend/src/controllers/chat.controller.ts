import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';
import Interest from '../models/Interest';

export const getChatRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = req.params.id as string;
    const chatRoom = await ChatRoom.findById(roomId)
      .populate('participants', 'id name avatar');

    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found' });
      return;
    }

    const isParticipant = chatRoom.participants.some((p: any) => p._id.toString() === req.user!.id);
    if (!isParticipant) {
      res.status(403).json({ error: 'Not a participant in this chat room' });
      return;
    }

    // Populate interest and listing details manually
    const interest = await Interest.findById(chatRoom.interestId)
      .populate('listing', 'id title images')
      .populate('tenant', 'id name');

    const obj = chatRoom.toJSON();
    res.json({
      ...obj,
      interest,
    });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = req.params.id as string;
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Verify participant
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found' });
      return;
    }
    const isParticipant = chatRoom.participants.some((p: any) => p.toString() === req.user!.id);
    if (!isParticipant) {
      res.status(403).json({ error: 'Not a participant' });
      return;
    }

    const messages = await Message.find({ chatRoomId: roomId })
      .populate('sender', 'id name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Message.countDocuments({ chatRoomId: roomId });

    res.json({ messages, total });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const chatRoomId = req.params.id as string;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found' });
      return;
    }
    const isParticipant = chatRoom.participants.some((p: any) => p.toString() === req.user!.id);
    if (!isParticipant) {
      res.status(403).json({ error: 'Not a participant' });
      return;
    }

    const messageDoc = await Message.create({
      chatRoomId,
      senderId: req.user!.id,
      content,
    });

    const message = await Message.findById(messageDoc._id)
      .populate('sender', 'id name avatar');

    // Emit via socket
    const io = req.app.get('io');
    io?.to(`room:${chatRoomId}`).emit('message:new', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMyChatRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user!.id,
    }).populate('participants', 'id name avatar');

    const formattedRooms = [];
    for (const room of chatRooms) {
      const interest = await Interest.findById(room.interestId)
        .populate('listing', 'id title images');

      const messages = await Message.find({ chatRoomId: room._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('sender', 'id name');

      formattedRooms.push({
        ...room.toJSON(),
        interest,
        messages,
      });
    }

    res.json(formattedRooms);
  } catch (error) {
    console.error('Get my chat rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
};
