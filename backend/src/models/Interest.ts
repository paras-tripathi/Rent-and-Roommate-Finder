import mongoose, { Schema, Document } from 'mongoose';

export interface IInterest extends Document {
  tenantId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string;
  tenant?: any;
  listing?: any;
  chatRoom?: any;
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound unique index
InterestSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

// Virtual relations
InterestSchema.virtual('listing', {
  ref: 'Listing',
  localField: 'listingId',
  foreignField: '_id',
  justOne: true,
});

InterestSchema.virtual('tenant', {
  ref: 'User',
  localField: 'tenantId',
  foreignField: '_id',
  justOne: true,
});

InterestSchema.virtual('chatRoom', {
  ref: 'ChatRoom',
  localField: '_id',
  foreignField: 'interestId',
  justOne: true,
});

InterestSchema.set('toJSON', { virtuals: true });
InterestSchema.set('toObject', { virtuals: true });

export default mongoose.model<IInterest>('Interest', InterestSchema);
