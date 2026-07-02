import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Listing from '../models/Listing';
import Interest from '../models/Interest';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      users,
      listings,
      interests,
      chatRooms,
      messages,
      tenants,
      owners,
      activeListings,
      filledListings,
      pendingInterests,
      acceptedInterests,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Interest.countDocuments(),
      ChatRoom.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ role: 'TENANT' }),
      User.countDocuments({ role: 'OWNER' }),
      Listing.countDocuments({ status: 'ACTIVE' }),
      Listing.countDocuments({ status: 'FILLED' }),
      Interest.countDocuments({ status: 'PENDING' }),
      Interest.countDocuments({ status: 'ACCEPTED' }),
    ]);

    res.json({
      users,
      listings,
      interests,
      chatRooms,
      messages,
      tenants,
      owners,
      activeListings,
      filledListings,
      pendingInterests,
      acceptedInterests,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const users = await User.find(query)
      .select('id name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const toggleUserActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Prevent self-deactivation
    if (user._id.toString() === req.user!.id) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }
    const updated = await User.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { new: true, select: 'id isActive' }
    );
    res.json({ id: updated?._id.toString(), isActive: updated?.isActive });
  } catch {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
};

export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const query: any = {};
    if (status) query.status = status;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const listings = await Listing.find(query)
      .populate('owner', 'id name')
      .populate('interestsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Listing.countDocuments(query);
    
    const formattedListings = listings.map(l => {
      const obj = l.toJSON();
      return {
        ...obj,
        _count: { interests: obj.interestsCount || 0 }
      };
    });

    res.json({ listings: formattedListings, total });
  } catch (error) {
    console.error('Admin getAllListings error:', error);
    res.status(500).json({ error: 'Failed to fetch all listings' });
  }
};

export const deleteListingAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    await Listing.findByIdAndDelete(listingId);
    res.json({ message: 'Listing deleted by admin' });
  } catch {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};
