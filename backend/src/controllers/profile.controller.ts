import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import TenantProfile from '../models/TenantProfile';
import OwnerProfile from '../models/OwnerProfile';

export const upsertTenantProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferredLocation, budgetMin, budgetMax, moveInDate, bio, preferences } = req.body;
    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user!.id },
      {
        preferredLocation,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        moveInDate: new Date(moveInDate),
        bio,
        preferences,
      },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Upsert tenant profile error:', error);
    res.status(500).json({ error: 'Failed to save tenant profile' });
  }
};

export const getTenantProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await TenantProfile.findOne({ userId: req.user!.id });
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tenant profile' });
  }
};

export const upsertOwnerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, address, bio } = req.body;
    const profile = await OwnerProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { phone, address, bio },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Upsert owner profile error:', error);
    res.status(500).json({ error: 'Failed to save owner profile' });
  }
};

export const getOwnerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await OwnerProfile.findOne({ userId: req.user!.id });
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Failed to fetch owner profile' });
  }
};
