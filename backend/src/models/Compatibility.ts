import mongoose, { Schema, Document } from 'mongoose';

export interface ICompatibility extends Document {
  listingId: mongoose.Types.ObjectId;
  tenantProfileId: mongoose.Types.ObjectId;
  score: number;
  explanation: string;
  isAiFallback: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompatibilitySchema: Schema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    tenantProfileId: { type: Schema.Types.ObjectId, ref: 'TenantProfile', required: true },
    score: { type: Number, required: true },
    explanation: { type: String, required: true },
    isAiFallback: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique constraint mapping
CompatibilitySchema.index({ listingId: 1, tenantProfileId: 1 }, { unique: true });

export default mongoose.model<ICompatibility>('Compatibility', CompatibilitySchema);
