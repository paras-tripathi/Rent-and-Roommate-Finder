import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  sendInterestNotificationToOwner,
  sendInterestAcceptedToTenant,
  sendInterestDeclinedToTenant,
} from '../services/email.service';
import Interest from '../models/Interest';
import Listing from '../models/Listing';
import TenantProfile from '../models/TenantProfile';
import Compatibility from '../models/Compatibility';
import Notification from '../models/Notification';
import ChatRoom from '../models/ChatRoom';
import User from '../models/User';

export const sendInterest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId).populate('owner');
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Listing is no longer available' });
      return;
    }
    if (listing.ownerId.toString() === req.user!.id) {
      res.status(400).json({ error: 'Cannot express interest in your own listing' });
      return;
    }

    const existing = await Interest.findOne({ tenantId: req.user!.id, listingId });
    if (existing) {
      res.status(409).json({ error: 'Already expressed interest', interest: existing });
      return;
    }

    const interestDoc = await Interest.create({
      tenantId: req.user!.id,
      listingId,
      message,
    });

    const interest = await Interest.findById(interestDoc._id)
      .populate('tenant', 'id name email')
      .populate('listing', 'title');

    // Get compatibility score for email
    const tenantProfile = await TenantProfile.findOne({ userId: req.user!.id });
    let score = 0;
    if (tenantProfile) {
      const compat = await Compatibility.findOne({
        listingId,
        tenantProfileId: tenantProfile._id,
      });
      if (compat) score = compat.score;
    }

    // Send email to owner
    const owner = listing.owner as any;
    if (owner) {
      await sendInterestNotificationToOwner(
        owner.email,
        owner.name,
        req.user!.name,
        listing.title,
        score
      );
    }

    // Create in-app notification for owner
    const io = req.app.get('io');
    const notification = await Notification.create({
      userId: listing.ownerId,
      title: 'New Interest',
      body: `${req.user!.name} is interested in your listing: ${listing.title}`,
      type: 'INTEREST',
      link: `/dashboard/owner`,
    });
    io?.to(`user:${listing.ownerId}`).emit('notification:new', notification);

    res.status(201).json(interest);
  } catch (error) {
    console.error('Send interest error:', error);
    res.status(500).json({ error: 'Failed to send interest' });
  }
};

export const respondToInterest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // ACCEPTED or DECLINED

    const interest = await Interest.findById(id)
      .populate('listing')
      .populate('tenant');
    if (!interest) {
      res.status(404).json({ error: 'Interest not found' });
      return;
    }
    
    const listing = interest.listing as any;
    if (!listing) {
      res.status(404).json({ error: 'Listing not found for this interest' });
      return;
    }
    
    if (listing.ownerId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to respond to this interest' });
      return;
    }
    if (interest.status !== 'PENDING') {
      res.status(400).json({ error: 'Interest already responded to' });
      return;
    }

    const updated = await Interest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    const io = req.app.get('io');
    const tenant = interest.tenant as any;

    if (status === 'ACCEPTED') {
      // Create chat room
      const chatRoom = await ChatRoom.create({
        interestId: id,
        participants: [req.user!.id, interest.tenantId],
      });

      // Notify tenant
      const notification = await Notification.create({
        userId: interest.tenantId,
        title: 'Interest Accepted! 🎉',
        body: `Your interest in "${listing.title}" was accepted. Start chatting now!`,
        type: 'INTEREST_ACCEPTED',
        link: `/chat/${chatRoom._id}`,
      });
      io?.to(`user:${interest.tenantId}`).emit('notification:new', notification);
      io?.to(`user:${interest.tenantId}`).emit('interest:accepted', {
        chatRoomId: chatRoom._id.toString(),
        listingTitle: listing.title,
      });

      if (tenant) {
        await sendInterestAcceptedToTenant(
          tenant.email,
          tenant.name,
          listing.title,
          req.user!.name
        );
      }

      res.json({ ...updated?.toJSON(), chatRoomId: chatRoom._id.toString() });
    } else {
      // DECLINED
      const notification = await Notification.create({
        userId: interest.tenantId,
        title: 'Interest Update',
        body: `Your interest in "${listing.title}" was not accepted at this time.`,
        type: 'INTEREST_DECLINED',
        link: `/dashboard/tenant`,
      });
      io?.to(`user:${interest.tenantId}`).emit('notification:new', notification);

      if (tenant) {
        await sendInterestDeclinedToTenant(
          tenant.email,
          tenant.name,
          listing.title
        );
      }

      res.json(updated);
    }
  } catch (error) {
    console.error('Respond to interest error:', error);
    res.status(500).json({ error: 'Failed to respond to interest' });
  }
};

export const getMyInterests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interests = await Interest.find({ tenantId: req.user!.id })
      .populate({
        path: 'listing',
        populate: { path: 'owner', select: 'id name' }
      })
      .sort({ createdAt: -1 });

    // Since chatRoom is a virtual, we can populate it or queries it manually
    const formattedInterests = [];
    for (const interest of interests) {
      const chatRoom = await ChatRoom.findOne({ interestId: interest._id }).select('id');
      const obj = interest.toJSON();
      formattedInterests.push({
        ...obj,
        chatRoom: chatRoom ? { id: chatRoom._id.toString() } : null,
      });
    }

    res.json(formattedInterests);
  } catch (error) {
    console.error('Get my interests error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

export const withdrawInterest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interest = await Interest.findById(req.params.id as string);
    if (!interest) {
      res.status(404).json({ error: 'Interest not found' });
      return;
    }
    if (interest.tenantId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    if (interest.status !== 'PENDING') {
      res.status(400).json({ error: 'Cannot withdraw an already-responded interest' });
      return;
    }
    await Interest.findByIdAndDelete(req.params.id as string);
    res.json({ message: 'Interest withdrawn successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to withdraw interest' });
  }
};
