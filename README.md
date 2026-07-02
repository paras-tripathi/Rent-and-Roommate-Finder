# 🏠 Rent & Flatmate Finder

> **AI-Powered Room & Flatmate Matching Platform** — Connect property owners and tenants intelligently using GPT-powered compatibility scoring, real-time chat, and a modern full-stack architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)](https://mongoosejs.com/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [AI Compatibility Engine](#ai-compatibility-engine)
- [Deployment](#deployment)
- [Test Accounts](#test-accounts)

---

## ✨ Features

### 👤 Tenant Features
- Register/Login with role-based auth
- Create tenant profile (location, budget, move-in date)
- Browse & search room listings with AI compatibility scores
- Filter by location and budget
- Listings ranked by compatibility score
- Send interest requests with optional message
- View interest request status (Pending/Accepted/Declined)
- Real-time chat after owner accepts

### 🏠 Owner Features
- Register/Login
- Create/Edit/Delete room listings
- Upload multiple photos (Cloudinary)
- View interested tenants with compatibility scores
- Accept or decline interest requests
- Mark listings as Filled (removes from search)
- Real-time chat with accepted tenants

### 🛡️ Admin Features
- Platform overview & analytics
- Manage all users (activate/deactivate)
- View all listings
- Platform activity stats

### 🤖 AI Compatibility Engine
- GPT-3.5-turbo powered scoring (0-100)
- Rule-based fallback (never crashes)
- Score cached in database (no recomputation)
- Budget match + Location match criteria
- Human-readable explanation

### 💬 Real-time Chat
- Socket.io WebSocket messaging
- Typing indicator
- Seen/delivered status
- Message history persisted in MongoDB

### 📧 Email Notifications
- Owner notified when high-compatibility tenant sends interest
- Tenant notified when interest is accepted or declined
- Nodemailer with SMTP (Gmail compatible)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3 |
| State | React Context + TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io |
| AI | Google Gemini 1.5 Flash + Rule-based fallback |
| Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Deployment | Frontend → Vercel, Backend → Render/Railway |

---

## 📁 Project Structure

```
Rent & Flatmate Finder/
├── frontend/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── ListingCard.tsx
│   │   │   ├── CompatibilityBadge.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/                # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ListingDetailPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── tenant/
│   │   │   │   └── TenantDashboard.tsx
│   │   │   ├── owner/
│   │   │   │   └── OwnerDashboard.tsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.tsx
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/                  # Utilities
│   │   │   ├── api.ts            # Axios + API functions
│   │   │   └── socket.ts         # Socket.io client
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx               # Routes & providers
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                      # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── listing.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── compatibility.controller.ts
│   │   │   ├── interest.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/               # Express routes
│   │   ├── middleware/           # Auth, role, validation
│   │   ├── services/             # Business logic
│   │   │   ├── ai.service.ts     # OpenAI + fallback
│   │   │   ├── email.service.ts  # Nodemailer
│   │   │   ├── cloudinary.service.ts
│   │   │   └── socket.service.ts # Socket.io handlers
│   │   └── index.ts              # App entry point
│   ├── src/
│   │   ├── seed.ts               # Sample data seed script
│   └── .env.example
│
├── README.md
├── SYSTEM_DESIGN.md
└── .env.example
```

---

## 📦 Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v5 or higher (local or cloud Atlas)
- **npm** or **yarn**

Optional (for full features):
- Google Gemini API Key
- Cloudinary account
- Gmail / SMTP credentials

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/rent-flatmate-finder.git
cd "rent-flatmate-finder"
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rentflatmate

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google Gemini (optional — falls back to rule-based scoring)
GEMINI_API_KEY=your-gemini-api-key-here

# Cloudinary (optional — uses placeholder images without this)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email/SMTP (optional — skips emails without this)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Rent & Flatmate Finder <noreply@rentflatmate.com>

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

> **Note:** The app works without Gemini, Cloudinary, and email keys. It uses rule-based AI scoring, placeholder images, and skips emails gracefully.

---

### 1. Seed sample data
```bash
cd backend
npm run db:seed
```

This creates:
- 1 Admin account
- 2 Owner accounts with profiles and listings
- 2 Tenant accounts with profiles
- Sample compatibility scores
- 1 accepted interest with chat room and sample messages

---

## ▶️ Running Locally

### Start Backend
```bash
cd backend
npm run dev
# Server starts at http://localhost:3001
```

### Start Frontend
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

---

## 🧪 Test Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentflatmate.com | admin123456 |
| Owner | sarah.owner@example.com | owner123456 |
| Owner | michael.owner@example.com | owner123456 |
| Tenant | alice.tenant@example.com | tenant123456 |
| Tenant | bob.tenant@example.com | tenant123456 |

---

## 📡 API Documentation

### Base URL: `http://localhost:3001/api`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "TENANT"
}
```

**Login Response:**
```json
{
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "TENANT" },
  "token": "eyJhbGci..."
}
```

---

### Listings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/listings` | Get all active listings (filterable) | ❌ |
| GET | `/listings/:id` | Get single listing | ❌ |
| GET | `/listings/my` | Get owner's listings | ✅ OWNER |
| POST | `/listings` | Create listing | ✅ OWNER |
| PUT | `/listings/:id` | Update listing | ✅ OWNER |
| DELETE | `/listings/:id` | Delete listing | ✅ OWNER |
| PATCH | `/listings/:id/fill` | Mark as filled | ✅ OWNER |

**Query Parameters (GET /listings):**
- `location` — filter by location (partial match)
- `minBudget` — minimum rent
- `maxBudget` — maximum rent
- `page` — page number (default: 1)
- `limit` — items per page (default: 12)

---

### Profiles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profiles/tenant` | Get tenant profile | ✅ TENANT |
| POST | `/profiles/tenant` | Create/update tenant profile | ✅ TENANT |
| POST | `/profiles/owner` | Create/update owner profile | ✅ OWNER |

---

### Compatibility

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/compatibility/:listingId` | Get/compute compatibility score | ✅ TENANT |

**Response:**
```json
{
  "id": "uuid",
  "score": 87.5,
  "explanation": "Excellent match! Budget aligns perfectly and location matches your preference.",
  "isAiFallback": false
}
```

---

### Interests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/interests` | Send interest request | ✅ TENANT |
| GET | `/interests/my` | Get my interests | ✅ TENANT |
| PATCH | `/interests/:id/respond` | Accept/decline interest | ✅ OWNER |

**Send Interest:**
```json
{ "listingId": "uuid", "message": "I am very interested!" }
```

**Respond:**
```json
{ "status": "ACCEPTED" }
```

---

### Chat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/chat/rooms` | Get my chat rooms | ✅ |
| GET | `/chat/rooms/:id` | Get chat room details | ✅ |
| GET | `/chat/rooms/:id/messages` | Get message history | ✅ |

---

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get notifications | ✅ |
| PATCH | `/notifications/read` | Mark all as read | ✅ |

---

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Platform statistics | ✅ ADMIN |
| GET | `/admin/users` | List all users | ✅ ADMIN |
| PATCH | `/admin/users/:id/toggle` | Toggle user active | ✅ ADMIN |
| GET | `/admin/listings` | List all listings | ✅ ADMIN |

---

### Socket.io Events

**Client → Server:**
```
join:room     { chatRoomId }
leave:room    { chatRoomId }
message:send  { chatRoomId, content }
typing:start  chatRoomId
typing:stop   chatRoomId
message:seen  { chatRoomId }
```

**Server → Client:**
```
message:new       Message object
typing:start      { userId, name }
typing:stop       { userId }
message:seen      { userId }
notification:new  { title, body }
interest:accepted { chatRoomId, listingTitle }
```

---

## 🤖 AI Compatibility Engine

### LLM Prompt

```
Given this room listing:
{
  "title": "Spacious 1BHK in Bandra West",
  "location": "Bandra West, Mumbai",
  "rent": 22000,
  "roomType": "APARTMENT",
  "furnishing": "FURNISHED",
  "description": "Beautiful fully furnished apartment..."
}

and this tenant profile:
{
  "preferredLocation": "Bandra, Mumbai",
  "budgetMin": 15000,
  "budgetMax": 25000,
  "moveInDate": "2024-09-01",
  "preferences": "Furnished, near metro"
}

Compute a compatibility score from 0-100 based on:
- Budget match (does the rent fall within tenant's budget range?)
- Location match (does the listing location match tenant's preferred location?)
- Room type and furnishing preferences

Return ONLY valid JSON with this exact structure:
{"score": number, "explanation": string}
```

### Sample AI Output
```json
{
  "score": 92,
  "explanation": "Excellent match! The rent of ₹22,000 falls perfectly within Alice's budget range of ₹15,000-₹25,000. The Bandra West location is an exact match for her preferred Bandra area. The furnished apartment aligns with her stated preferences."
}
```

### Rule-Based Fallback Algorithm
```
Budget Match (50 points):
  - Rent within range: 50 pts
  - Rent ≤ 110% of max budget: 30 pts
  - Rent below min (great deal): 40 pts
  - Rent above 110% of budget: 0 pts

Location Match (50 points):
  - Exact/substring match: 50 pts
  - Partial word match: 25 pts
  - No match: 0 pts

Total Score = Budget Points + Location Points (max 100)
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import in Vercel dashboard
3. Set environment variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. Push `backend/` to GitHub
2. Create Web Service on Render
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Set all environment variables (see `.env.example`)
6. Set `MONGODB_URI` from your MongoDB Atlas cluster

### Database → MongoDB Atlas (Free)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Obtain your connection URI string
3. Add it as `MONGODB_URI` in your environment config

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Stateless, expires in 7 days
- **Role-Based Authorization**: Guards on every protected route
- **Rate Limiting**: 20 requests/15min on auth endpoints
- **Helmet.js**: Security headers
- **Input Validation**: Zod schemas on all inputs
- **CORS**: Configured for specific frontend origin

---

## 📝 License

MIT © 2024 Rent & Flatmate Finder
