import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'TENANT' | 'OWNER' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['TENANT', 'OWNER', 'ADMIN'], default: 'TENANT' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual for tenantProfile
UserSchema.virtual('tenantProfile', {
  ref: 'TenantProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Virtual for ownerProfile
UserSchema.virtual('ownerProfile', {
  ref: 'OwnerProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
