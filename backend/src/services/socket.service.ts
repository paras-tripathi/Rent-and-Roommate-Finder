import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';

export function initializeSocket(io: Server): void {
  // Auth middleware for socket
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.id}`);

    // Join user's personal room for notifications
    socket.join(`user:${user.id}`);

    // Join a chat room
    socket.on('join:room', (chatRoomId: string) => {
      socket.join(`room:${chatRoomId}`);
      console.log(`User ${user.id} joined room ${chatRoomId}`);
    });

    // Leave a chat room
    socket.on('leave:room', (chatRoomId: string) => {
      socket.leave(`room:${chatRoomId}`);
    });

    // Send message
    socket.on('message:send', async (data: { chatRoomId: string; content: string }) => {
      try {
        const messageDoc = await Message.create({
          chatRoomId: data.chatRoomId,
          senderId: user.id,
          content: data.content,
        });
        
        const message = await Message.findById(messageDoc._id).populate('sender', 'name avatar');
        io.to(`room:${data.chatRoomId}`).emit('message:new', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (chatRoomId: string) => {
      socket.to(`room:${chatRoomId}`).emit('typing:start', { userId: user.id, name: user.name });
    });

    socket.on('typing:stop', (chatRoomId: string) => {
      socket.to(`room:${chatRoomId}`).emit('typing:stop', { userId: user.id });
    });

    // Mark messages as seen
    socket.on('message:seen', async (data: { chatRoomId: string }) => {
      try {
        await Message.updateMany(
          {
            chatRoomId: data.chatRoomId,
            senderId: { $ne: user.id },
            seenAt: { $exists: false },
          },
          { seenAt: new Date() }
        );
        socket.to(`room:${data.chatRoomId}`).emit('message:seen', { userId: user.id });
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });
}
