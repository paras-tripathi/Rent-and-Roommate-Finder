import mongoose, { Schema, Document } from 'mongoose';

export interface IOwnerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  phone?: string;
  address?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IOwnerProfile>('OwnerProfile', OwnerProfileSchema);
