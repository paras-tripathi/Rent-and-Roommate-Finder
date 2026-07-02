import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoom extends Document {
  interestId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema: Schema = new Schema(
  {
    interestId: { type: Schema.Types.ObjectId, ref: 'Interest', required: true, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Virtual relations
ChatRoomSchema.virtual('interest', {
  ref: 'Interest',
  localField: 'interestId',
  foreignField: '_id',
  justOne: true,
});

ChatRoomSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatRoomId',
});

ChatRoomSchema.set('toJSON', { virtuals: true });
ChatRoomSchema.set('toObject', { virtuals: true });

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
