import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadImage, deleteImage } from '../services/cloudinary.service';
import { computeCompatibility } from '../services/ai.service';
import Listing from '../models/Listing';

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, location, rent, availableFrom, roomType, furnishing, description, images } = req.body;
    
    // Upload images
    const uploadedImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imageData of images) {
        const uploaded = await uploadImage(imageData, 'rent-flatmate/listings');
        uploadedImages.push({ url: uploaded.url, publicId: uploaded.publicId });
      }
    }

    const listing = await Listing.create({
      ownerId: req.user!.id,
      title,
      location,
      rent: parseFloat(rent),
      availableFrom: new Date(availableFrom),
      roomType,
      furnishing,
      description,
      images: uploadedImages,
    });

    const fullListing = await Listing.findById(listing._id)
      .populate('owner', 'id name email');

    res.status(201).json(fullListing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

export const getListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      location,
      minBudget,
      maxBudget,
      roomType,
      furnishing,
      page = '1',
      limit = '12',
    } = req.query;

    const query: any = { status: 'ACTIVE' };
    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }
    if (roomType) {
      query.roomType = roomType;
    }
    if (furnishing) {
      query.furnishing = furnishing;
    }
    if (minBudget || maxBudget) {
      query.rent = {};
      if (minBudget) query.rent.$gte = parseFloat(minBudget as string);
      if (maxBudget) query.rent.$lte = parseFloat(maxBudget as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const pageSize = parseInt(limit as string);

    // Check if the user is a logged-in Tenant with a profile
    let tenantProfile = null;
    if (req.user && req.user.role === 'TENANT') {
      const TenantProfileModel = mongoose.model('TenantProfile');
      tenantProfile = await TenantProfileModel.findOne({ userId: req.user.id });
    }

    let formattedListings: any[] = [];
    let total = 0;

    if (tenantProfile) {
      // Fetch ALL active matching listings so we can compute/sort them by compatibility
      const allListings = await Listing.find(query)
        .populate('owner', 'id name')
        .populate('interestsCount');

      const CompatibilityModel = mongoose.model('Compatibility');
      const tempFormattedListings = [];

      for (const listing of allListings) {
        let comp = await CompatibilityModel.findOne({
          listingId: listing._id,
          tenantProfileId: tenantProfile._id,
        });

        if (!comp) {
          try {
            const result = await computeCompatibility(
              {
                title: listing.title,
                location: listing.location,
                rent: listing.rent,
                roomType: listing.roomType,
                furnishing: listing.furnishing,
                description: listing.description || '',
              },
              {
                preferredLocation: tenantProfile.preferredLocation,
                budgetMin: tenantProfile.budgetMin,
                budgetMax: tenantProfile.budgetMax,
                moveInDate: tenantProfile.moveInDate.toISOString(),
                preferences: tenantProfile.preferences,
              }
            );

            comp = await CompatibilityModel.create({
              listingId: listing._id,
              tenantProfileId: tenantProfile._id,
              score: result.score,
              explanation: result.explanation,
              isAiFallback: result.isAiFallback,
            });
          } catch (err) {
            console.error('Error computing compatibility for listing:', listing._id, err);
          }
        }

        const obj = listing.toJSON();
        tempFormattedListings.push({
          ...obj,
          _count: { interests: obj.interestsCount || 0 },
          compatibilityScore: comp ? comp.score : 0,
        });
      }

      // Sort by compatibility score in descending order
      tempFormattedListings.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      total = tempFormattedListings.length;
      formattedListings = tempFormattedListings.slice(skip, skip + pageSize);
    } else {
      // Normal flow: sort by creation date
      const listings = await Listing.find(query)
        .populate('owner', 'id name')
        .populate('interestsCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      total = await Listing.countDocuments(query);

      formattedListings = listings.map(l => {
        const obj = l.toJSON();
        return {
          ...obj,
          _count: { interests: obj.interestsCount || 0 },
        };
      });
    }

    res.json({
      listings: formattedListings,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const getListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId)
      .populate({
        path: 'owner',
        select: 'id name email',
        populate: { path: 'ownerProfile' }
      })
      .populate('interestsCount');

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const obj = listing.toJSON();
    const formattedListing = {
      ...obj,
      _count: { interests: obj.interestsCount || 0 }
    };

    res.json(formattedListing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.ownerId.toString() !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const { title, location, rent, availableFrom, roomType, furnishing, description } = req.body;
    
    const updated = await Listing.findByIdAndUpdate(
      listingId,
      {
        title,
        location,
        rent: rent ? parseFloat(rent) : undefined,
        availableFrom: availableFrom ? new Date(availableFrom) : undefined,
        roomType,
        furnishing,
        description,
      },
      { new: true }
    ).populate('owner', 'id name');

    res.json(updated);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.ownerId.toString() !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Delete images from Cloudinary
    for (const img of listing.images) {
      await deleteImage(img.publicId);
    }

    await Listing.findByIdAndDelete(listingId);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

export const markFilled = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.ownerId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    const updated = await Listing.findByIdAndUpdate(
      listingId,
      { status: 'FILLED' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error('Mark filled error:', error);
    res.status(500).json({ error: 'Failed to mark listing as filled' });
  }
};

export const markActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.ownerId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    const updated = await Listing.findByIdAndUpdate(
      listingId,
      { status: 'ACTIVE' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error('Mark active error:', error);
    res.status(500).json({ error: 'Failed to mark listing as active' });
  }
};

export const getOwnerListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // We want owner listings including interests with populated tenant details
    const listings = await Listing.find({ ownerId: req.user!.id })
      .populate('interestsCount')
      .sort({ createdAt: -1 });

    // Since in Mongoose we query interests separately or populate them, let's query interests for these listings:
    // To make it easy, we can map over listings and query interests
    const formattedListings = [];
    for (const listing of listings) {
      const Interest = mongoose.model('Interest');
      const ChatRoom = mongoose.model('ChatRoom');
      const interests = await Interest.find({ listingId: listing._id })
        .populate('tenant', 'id name email tenantProfile')
        .sort({ createdAt: -1 });

      const formattedInterests = [];
      for (const interest of interests) {
        const chatRoom = await ChatRoom.findOne({ interestId: interest._id }).select('id');
        const obj = interest.toJSON();
        formattedInterests.push({
          ...obj,
          chatRoom: chatRoom ? { id: chatRoom._id.toString() } : null,
        });
      }
        
      const obj = listing.toJSON();
      formattedListings.push({
        ...obj,
        _count: { interests: obj.interestsCount || 0 },
        interests: formattedInterests,
      });
    }

    res.json(formattedListings);
  } catch (error) {
    console.error('Get owner listings error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
};

import mongoose from 'mongoose';
