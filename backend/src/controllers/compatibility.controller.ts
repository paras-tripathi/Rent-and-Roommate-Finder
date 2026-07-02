import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { computeCompatibility } from '../services/ai.service';
import Compatibility from '../models/Compatibility';
import TenantProfile from '../models/TenantProfile';
import Listing from '../models/Listing';

export const getCompatibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.listingId as string;

    const tenantProfile = await TenantProfile.findOne({ userId: req.user!.id });
    if (!tenantProfile) {
      res.status(404).json({ error: 'Create a tenant profile first to see compatibility' });
      return;
    }

    // Return cached score if exists
    const existing = await Compatibility.findOne({
      listingId,
      tenantProfileId: tenantProfile._id,
    });
    if (existing) {
      res.json(existing);
      return;
    }

    // Compute new score
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const result = await computeCompatibility(
      {
        title: listing.title,
        location: listing.location,
        rent: listing.rent,
        roomType: listing.roomType,
        furnishing: listing.furnishing,
        description: listing.description,
      },
      {
        preferredLocation: tenantProfile.preferredLocation,
        budgetMin: tenantProfile.budgetMin,
        budgetMax: tenantProfile.budgetMax,
        moveInDate: tenantProfile.moveInDate.toISOString(),
        preferences: tenantProfile.preferences,
      }
    );

    const compatibility = await Compatibility.create({
      listingId,
      tenantProfileId: tenantProfile._id,
      score: result.score,
      explanation: result.explanation,
      isAiFallback: result.isAiFallback,
    });
    res.json(compatibility);
  } catch (error) {
    console.error('Compatibility error:', error);
    res.status(500).json({ error: 'Failed to compute compatibility' });
  }
};

export const bulkCompatibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingIds } = req.body;
    if (!Array.isArray(listingIds)) {
      res.status(400).json({ error: 'listingIds must be an array' });
      return;
    }

    const tenantProfile = await TenantProfile.findOne({ userId: req.user!.id });
    if (!tenantProfile) {
      res.status(404).json({ error: 'Create a tenant profile first' });
      return;
    }

    const results: Record<string, any> = {};

    for (const listingId of listingIds) {
      const existing = await Compatibility.findOne({
        listingId,
        tenantProfileId: tenantProfile._id,
      });
      if (existing) {
        results[listingId] = existing;
        continue;
      }

      const listing = await Listing.findById(listingId);
      if (!listing) continue;

      const result = await computeCompatibility(
        {
          title: listing.title,
          location: listing.location,
          rent: listing.rent,
          roomType: listing.roomType,
          furnishing: listing.furnishing,
          description: listing.description,
        },
        {
          preferredLocation: tenantProfile.preferredLocation,
          budgetMin: tenantProfile.budgetMin,
          budgetMax: tenantProfile.budgetMax,
          moveInDate: tenantProfile.moveInDate.toISOString(),
          preferences: tenantProfile.preferences,
        }
      );

      const compatibility = await Compatibility.create({
        listingId,
        tenantProfileId: tenantProfile._id,
        score: result.score,
        explanation: result.explanation,
        isAiFallback: result.isAiFallback,
      });
      results[listingId] = compatibility;
    }

    res.json(results);
  } catch (error) {
    console.error('Bulk compatibility error:', error);
    res.status(500).json({ error: 'Failed to compute compatibility scores' });
  }
};
