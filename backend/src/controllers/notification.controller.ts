import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Notification from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);
      
    const unreadCount = await Notification.countDocuments({
      userId: req.user!.id,
      read: false,
    });
    
    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notificationId = req.params.id as string;
    const notification = await Notification.findOne({ _id: notificationId, userId: req.user!.id });
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};
