import mongoose, { Schema, Document } from 'mongoose';

export interface IListingImage {
  url: string;
  publicId: string;
  createdAt: Date;
}

export interface IListing extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  location: string;
  rent: number;
  availableFrom: Date;
  roomType: 'SINGLE' | 'SHARED' | 'STUDIO' | 'APARTMENT' | 'PG';
  furnishing: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  description: string;
  status: 'ACTIVE' | 'FILLED' | 'DELETED';
  images: IListingImage[];
  owner?: any;
  interestsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ListingSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rent: { type: Number, required: true },
    availableFrom: { type: Date, required: true },
    roomType: { type: String, enum: ['SINGLE', 'SHARED', 'STUDIO', 'APARTMENT', 'PG'], required: true },
    furnishing: { type: String, enum: ['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'FILLED', 'DELETED'], default: 'ACTIVE' },
    images: [ListingImageSchema],
  },
  { timestamps: true }
);

// Virtual for owner details
ListingSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for interests count
ListingSchema.virtual('interestsCount', {
  ref: 'Interest',
  localField: '_id',
  foreignField: 'listingId',
  count: true,
});

ListingSchema.set('toJSON', { virtuals: true });
ListingSchema.set('toObject', { virtuals: true });

export default mongoose.model<IListing>('Listing', ListingSchema);
