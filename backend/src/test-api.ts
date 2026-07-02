import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

// Import our Express app configuration (without starting the listener from index.ts)
// Wait, index.ts starts the server directly. So we can build a mini test server using our routes and models.
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import profileRoutes from './routes/profile.routes';
import compatibilityRoutes from './routes/compatibility.routes';
import interestRoutes from './routes/interest.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import User from './models/User';
import TenantProfile from './models/TenantProfile';
import OwnerProfile from './models/OwnerProfile';
import Listing from './models/Listing';
import Compatibility from './models/Compatibility';
import Interest from './models/Interest';
import ChatRoom from './models/ChatRoom';
import Message from './models/Message';
import Notification from './models/Notification';

dotenv.config();

const PORT = 3002;
const TEST_API_URL = `http://localhost:${PORT}/api`;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentflatmate';

async function runTests() {
  console.log('🧪 Starting End-to-End API Integration Tests...');

  // Connect to DB
  await mongoose.connect(mongoUri);
  console.log('🔌 Connected to MongoDB');

  // Clear test data
  await Promise.all([
    User.deleteMany({ email: /test-.*@example\.com/ }),
    TenantProfile.deleteMany({}),
    OwnerProfile.deleteMany({}),
    Listing.deleteMany({ title: /Test Listing.*/ }),
    Compatibility.deleteMany({}),
    Interest.deleteMany({}),
    ChatRoom.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🧹 Cleared test data collections');

  // Set up Express App
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/compatibility', compatibilityRoutes);
  app.use('/api/interests', interestRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`🚀 Test server listening on port ${PORT}`);

  try {
    // 1. Register Owner
    console.log('\n--- 1. Testing User Registration ---');
    const ownerReg = await axios.post(`${TEST_API_URL}/auth/register`, {
      email: 'test-owner@example.com',
      password: 'password123',
      name: 'Test Owner',
      role: 'OWNER',
    });
    const ownerToken = ownerReg.data.token;
    console.log('✅ Owner registered successfully');

    // 2. Register Tenant
    const tenantReg = await axios.post(`${TEST_API_URL}/auth/register`, {
      email: 'test-tenant@example.com',
      password: 'password123',
      name: 'Test Tenant',
      role: 'TENANT',
    });
    const tenantToken = tenantReg.data.token;
    console.log('✅ Tenant registered successfully');

    // 3. Setup Owner Profile
    console.log('\n--- 2. Testing Profiles API ---');
    const ownerProfileRes = await axios.post(
      `${TEST_API_URL}/profiles/owner`,
      { phone: '+91-9999999999', address: '123 Test Street, Mumbai', bio: 'I am a test owner' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log('✅ Owner profile created/updated:', ownerProfileRes.data.phone);

    // 4. Setup Tenant Profile
    const tenantProfileRes = await axios.post(
      `${TEST_API_URL}/profiles/tenant`,
      {
        preferredLocation: 'Andheri West',
        budgetMin: 10000,
        budgetMax: 20000,
        moveInDate: '2026-07-01',
        bio: 'I am a test tenant looking for a room',
        preferences: 'Non-smoker, clean room',
      },
      { headers: { Authorization: `Bearer ${tenantToken}` } }
    );
    console.log('✅ Tenant profile created/updated:', tenantProfileRes.data.preferredLocation);

    // 5. Create Listing (Owner)
    console.log('\n--- 3. Testing Listings API ---');
    const listingRes = await axios.post(
      `${TEST_API_URL}/listings`,
      {
        title: 'Test Listing in Andheri West',
        location: 'Andheri West, Mumbai',
        rent: 15000,
        availableFrom: '2026-07-01',
        roomType: 'SINGLE',
        furnishing: 'FURNISHED',
        description: 'A beautiful test room in Andheri West close to the metro station.',
        images: [],
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    const listingId = listingRes.data.id;
    console.log('✅ Listing created successfully. ID:', listingId);

    // 6. Compute/Get Compatibility Score (Tenant)
    console.log('\n--- 4. Testing AI Compatibility Engine ---');
    const compatibilityRes = await axios.get(
      `${TEST_API_URL}/compatibility/${listingId}`,
      { headers: { Authorization: `Bearer ${tenantToken}` } }
    );
    console.log('✅ Compatibility Score calculated:', compatibilityRes.data.score);
    console.log('📝 Explanation:', compatibilityRes.data.explanation);

    // 7. Express Interest (Tenant)
    console.log('\n--- 5. Testing Interests Flow ---');
    const interestRes = await axios.post(
      `${TEST_API_URL}/interests`,
      { listingId, message: 'Hi! I am very interested in this room.' },
      { headers: { Authorization: `Bearer ${tenantToken}` } }
    );
    const interestId = interestRes.data.id;
    console.log('✅ Interest expressed successfully. ID:', interestId);

    // 8. Accept Interest (Owner) -> Creates Chat Room
    console.log('\n--- 6. Testing Owner Acceptance & Chat Room Creation ---');
    const respondRes = await axios.patch(
      `${TEST_API_URL}/interests/${interestId}/respond`,
      { status: 'ACCEPTED' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    const chatRoomId = respondRes.data.chatRoomId;
    console.log('✅ Owner accepted tenant interest. Status:', respondRes.data.status);
    console.log('💬 Chat Room created automatically. ID:', chatRoomId);

    // 9. Send Chat Message (Tenant)
    console.log('\n--- 7. Testing Message Logging & Persistence ---');
    // Simulate sending message via REST (normally sent via WebSocket)
    const mockMessage = await Message.create({
      chatRoomId,
      senderId: tenantReg.data.user.id,
      content: 'Hello! Thanks for accepting my interest.',
    });
    console.log('✅ Chat message persisted in database:', mockMessage.content);

    // 10. Fetch Chat Messages (Owner)
    const chatMessagesRes = await axios.get(
      `${TEST_API_URL}/chat/rooms/${chatRoomId}/messages`,
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log('✅ Chat message history loaded successfully. Message count:', chatMessagesRes.data.messages.length);

    // 11. Fetch Notifications (Owner)
    console.log('\n--- 8. Testing Notifications API ---');
    const notificationsRes = await axios.get(
      `${TEST_API_URL}/notifications`,
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log('✅ Notifications loaded successfully. Notification count:', notificationsRes.data.notifications.length);

    // 12. Run Admin Stats
    console.log('\n--- 9. Testing Admin Dashboard Analytics ---');
    // Register Admin
    const adminReg = await User.create({
      email: 'test-admin@example.com',
      password: 'password123',
      name: 'Test Admin',
      role: 'ADMIN',
    });
    const adminToken = require('jsonwebtoken').sign(
      { id: adminReg.id, email: adminReg.email, role: adminReg.role, name: adminReg.name },
      process.env.JWT_SECRET || 'secret'
    );
    
    const adminStatsRes = await axios.get(
      `${TEST_API_URL}/admin/stats`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Admin stats loaded successfully:', adminStatsRes.data);

    console.log('\n🏆 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🏆');

  } catch (error: any) {
    console.error('\n❌ Integration Test Failed!');
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    // Close servers and connection
    server.close();
    await mongoose.disconnect();
    console.log('\n🛑 Test server stopped. Database disconnected.');
  }
}

runTests();
