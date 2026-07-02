import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import TenantProfile from './models/TenantProfile';
import OwnerProfile from './models/OwnerProfile';
import Listing from './models/Listing';
import Compatibility from './models/Compatibility';
import Interest from './models/Interest';
import ChatRoom from './models/ChatRoom';
import Message from './models/Message';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentflatmate';

async function main() {
  console.log('🌱 Seeding MongoDB database...');
  await mongoose.connect(mongoUri);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    TenantProfile.deleteMany({}),
    OwnerProfile.deleteMany({}),
    Listing.deleteMany({}),
    Compatibility.deleteMany({}),
    Interest.deleteMany({}),
    ChatRoom.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🧹 Cleared all collections!');

  // Create admin
  const adminPass = await bcrypt.hash('admin123456', 12);
  await User.create({
    email: 'admin@rentflatmate.com',
    password: adminPass,
    name: 'Admin User',
    role: 'ADMIN',
  });

  // Create owners
  const ownerPass = await bcrypt.hash('owner123456', 12);
  const owner1 = await User.create({
    email: 'sarah.owner@example.com',
    password: ownerPass,
    name: 'Sarah Johnson',
    role: 'OWNER',
  });
  const owner2 = await User.create({
    email: 'michael.owner@example.com',
    password: ownerPass,
    name: 'Michael Chen',
    role: 'OWNER',
  });

  await OwnerProfile.create([
    { userId: owner1._id, phone: '+1-555-0101', address: 'Mumbai, Maharashtra', bio: 'Property investor with 10 years experience' },
    { userId: owner2._id, phone: '+1-555-0102', address: 'Pune, Maharashtra', bio: 'Landlord of multiple premium properties' }
  ]);

  // Create tenants
  const tenantPass = await bcrypt.hash('tenant123456', 12);
  const tenant1 = await User.create({
    email: 'alice.tenant@example.com',
    password: tenantPass,
    name: 'Alice Williams',
    role: 'TENANT',
  });
  const tenant2 = await User.create({
    email: 'bob.tenant@example.com',
    password: tenantPass,
    name: 'Bob Martinez',
    role: 'TENANT',
  });

  const tp1 = await TenantProfile.create({
    userId: tenant1._id,
    preferredLocation: 'Bandra, Mumbai',
    budgetMin: 15000,
    budgetMax: 25000,
    moveInDate: new Date('2024-09-01'),
    bio: 'Working professional, non-smoker',
    preferences: 'Furnished, near metro',
  });
  const tp2 = await TenantProfile.create({
    userId: tenant2._id,
    preferredLocation: 'Andheri, Mumbai',
    budgetMin: 12000,
    budgetMax: 20000,
    moveInDate: new Date('2024-08-15'),
    bio: 'IT professional looking for peaceful environment',
  });

  // Create listings
  const listing1 = await Listing.create({
    ownerId: owner1._id,
    title: 'Spacious 1BHK in Bandra West',
    location: 'Bandra West, Mumbai',
    rent: 22000,
    availableFrom: new Date('2024-09-01'),
    roomType: 'APARTMENT',
    furnishing: 'FURNISHED',
    description: 'Beautiful fully furnished 1BHK apartment with sea view. 24/7 security, power backup, parking available. Walking distance from Bandra station.',
    images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'seed_image_1' }],
  });

  const listing2 = await Listing.create({
    ownerId: owner2._id,
    title: 'Premium Studio in Andheri East',
    location: 'Andheri East, Mumbai',
    rent: 16000,
    availableFrom: new Date('2024-08-15'),
    roomType: 'STUDIO',
    furnishing: 'SEMI_FURNISHED',
    description: 'Modern studio apartment near metro station. AC, geyser, modular kitchen included. Ideal for working professionals.',
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', publicId: 'seed_image_2' }],
  });

  const listing3 = await Listing.create({
    ownerId: owner1._id,
    title: 'Shared Room in Powai',
    location: 'Powai, Mumbai',
    rent: 8000,
    availableFrom: new Date('2024-08-01'),
    roomType: 'SHARED',
    furnishing: 'FURNISHED',
    description: 'Comfortable shared accommodation in a well-maintained society near Hiranandani. All amenities included.',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'seed_image_3' }],
  });

  // Create compatibility scores
  await Compatibility.create([
    {
      listingId: listing1._id,
      tenantProfileId: tp1._id,
      score: 92,
      explanation: 'Excellent match! The rent of ₹22,000 falls within Alice\'s budget range. The Bandra West location perfectly matches her preferred area. The furnished apartment aligns with her preferences.',
    },
    {
      listingId: listing2._id,
      tenantProfileId: tp2._id,
      score: 88,
      explanation: 'Great match! The ₹16,000 rent fits within Bob\'s budget. Andheri East location matches his preference. The studio setup is ideal for a working professional.',
    }
  ]);

  // Create interest
  const interest = await Interest.create({
    tenantId: tenant1._id,
    listingId: listing1._id,
    status: 'ACCEPTED',
    message: 'Hi, I am very interested in this apartment. Can we discuss?',
  });

  // Create chat room
  const chatRoom = await ChatRoom.create({
    interestId: interest._id,
    participants: [owner1._id, tenant1._id],
  });

  // Add messages
  await Message.create([
    { chatRoomId: chatRoom._id, senderId: tenant1._id, content: 'Hi Sarah! I love your listing. Is it still available?', seenAt: new Date(), createdAt: new Date(Date.now() - 3600000) },
    { chatRoomId: chatRoom._id, senderId: owner1._id, content: 'Hi Alice! Yes, the apartment is still available. When would you like to visit?', seenAt: new Date(), createdAt: new Date(Date.now() - 3500000) },
    { chatRoomId: chatRoom._id, senderId: tenant1._id, content: 'That would be great! How about this Saturday afternoon?', seenAt: new Date(), createdAt: new Date(Date.now() - 3400000) },
    { chatRoomId: chatRoom._id, senderId: owner1._id, content: 'Saturday works perfectly! Let\'s say 3 PM. I\'ll send you the exact address.', createdAt: new Date(Date.now() - 3300000) },
  ]);

  console.log('✅ MongoDB database seeded successfully!');
  console.log('\n📧 Test Accounts:');
  console.log('Admin: admin@rentflatmate.com / admin123456');
  console.log('Owner 1: sarah.owner@example.com / owner123456');
  console.log('Owner 2: michael.owner@example.com / owner123456');
  console.log('Tenant 1: alice.tenant@example.com / tenant123456');
  console.log('Tenant 2: bob.tenant@example.com / tenant123456');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
