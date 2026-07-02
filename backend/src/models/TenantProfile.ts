import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantProfile extends Document {
  userId: mongoose.Types.ObjectId;
  preferredLocation: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: Date;
  bio?: string;
  preferences?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferredLocation: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    moveInDate: { type: Date, required: true },
    bio: { type: String, default: '' },
    preferences: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ITenantProfile>('TenantProfile', TenantProfileSchema);
