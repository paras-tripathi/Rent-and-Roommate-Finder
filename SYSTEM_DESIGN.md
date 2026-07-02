# System Design: Rent & Flatmate Finder

**Word Count:** ~780 words

---

## 1. Problem Statement

Rent & Flatmate Finder solves the inefficiency of traditional rental search by introducing AI-powered compatibility matching between tenants and room listings. Instead of manual browsing, tenants receive ranked listings with explainable match scores. Owners get filtered, quality leads. Real-time chat eliminates third-party communication tools.

---

## 2. Architecture Overview

The system uses a **three-tier client-server architecture** with a separate real-time layer via WebSockets.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│  React SPA (Vite + TypeScript + Tailwind CSS)           │
│  TanStack Query · Socket.io-client · React Router       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                   APPLICATION TIER                      │
│  Node.js + Express.js (TypeScript)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Auth API │ │Listing   │ │Interest  │ │  Chat API │  │
│  │ (JWT)    │ │  API     │ │   API    │ │(Socket.io)│  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   AI     │ │  Email   │ │Cloudinary│ │  Admin    │  │
│  │ Service  │ │ Service  │ │  Upload  │ │    API    │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                     DATA TIER                           │
│  MongoDB Database                                       │
│  Users · Listings · Interests · ChatRooms · Messages    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Database Design

**Core Entities and Relationships:**

- **User** → has one `TenantProfile` OR `OwnerProfile` based on role
- **Listing** → belongs to Owner, embeds `ListingImage`, has many `Interest`, `Compatibility`
- **Compatibility** → unique per `(listingId, tenantProfileId)` — score cached, never recomputed
- **Interest** → unique per `(tenantId, listingId)` — state machine: PENDING → ACCEPTED | DECLINED
- **ChatRoom** → created only when Interest is ACCEPTED; linked one-to-one with Interest
- **Message** → belongs to ChatRoom, tracks `seenAt` timestamp for read receipts
- **Notification** → user-scoped, supports real-time delivery via WebSocket

**Key Design Decisions:**
- Composite unique indexes prevent duplicate interests and scores
- Referenced relationships simulate cascade deletes to ensure integrity (e.g., deleting a listing removes its associated interests, compatibilities, and chat rooms)
- `ListingStatus` enum (`ACTIVE/FILLED/DELETED`) allows soft removal from search without data loss

---

## 4. Authentication & Authorization

JWT-based stateless auth with role guards:

1. On login, server signs a JWT containing `{ id, email, role, name }` with a 7-day expiry
2. Frontend stores token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request
3. Backend `authenticate` middleware verifies and decodes the token
4. `authorize(...roles)` middleware guards endpoints by role (TENANT, OWNER, ADMIN)
5. Socket.io connections authenticate via `socket.handshake.auth.token`

Passwords are hashed with bcryptjs (12 rounds). Rate limiting (20 req/15 min) protects auth endpoints.

---

## 5. AI Compatibility Engine

**Primary Path (Google Gemini 1.5 Flash):**
- A structured prompt containing listing data and tenant profile is sent to the Gemini 1.5 Flash model using the Google Generative AI SDK
- The model is configured to return JSON format: `{ score: number, explanation: string }`
- Score is clamped to 0–100

**Fallback Path (Rule-Based):**
- Triggered automatically if `GEMINI_API_KEY` is missing or the API call fails
- Budget match: 50 points if rent is within tenant's range
- Location match: 50 points for full match, 25 for partial word overlap
- Returns `isAiFallback: true` to indicate the method used

**Caching Strategy:**
- Scores are stored in the `Compatibility` collection with a unique index on `(listingId, tenantProfileId)`
- On subsequent requests, the cached score is returned immediately — no API call made
- This reduces Gemini API costs and latency for all repeat views

---

## 6. Real-Time Communication

Socket.io handles bidirectional communication:

- **Room-based architecture:** Each chat room has a Socket.io room (`room:{chatRoomId}`)
- **Personal rooms:** Each user joins `user:{userId}` for targeted notifications
- **Events:** `message:send` → persisted to DB → `message:new` broadcast to room
- **Typing indicators:** Client emits `typing:start/stop`; debounced with 2-second timeout
- **Seen receipts:** `message:seen` event triggers bulk update of `seenAt` timestamps

Socket connections authenticate via JWT during handshake — unauthenticated connections are rejected.

---

## 7. Interest & Chat Workflow

```
Tenant sends interest → Interest(PENDING) created
       ↓
Owner views interest → sees compatibility score & explanation
       ↓
Owner ACCEPTS → Interest(ACCEPTED) + ChatRoom created
              → Email sent to tenant
              → Socket notification to tenant
       ↓
Both parties can now chat via WebSocket
```

If owner DECLINES: Interest(DECLINED), email sent to tenant, no chat room created.

---

## 8. Storage & Media

Images are uploaded to **Cloudinary** as base64-encoded strings from the frontend. The backend calls the Cloudinary upload API and stores the returned `secure_url` and `public_id` in `ListingImage`. On listing deletion, images are removed from Cloudinary via the public ID.

If Cloudinary is not configured, a deterministic placeholder URL from `picsum.photos` is used.

---

## 9. Email Notifications

Nodemailer with SMTP transport sends transactional emails:
- Owner receives email when a tenant with compatibility score > 80 sends interest
- Tenant receives email on interest acceptance or decline

Email sending is non-blocking and fails silently if SMTP is not configured, ensuring the app never crashes.

---

## 10. Deployment Architecture

```
Vercel (Frontend CDN)          Render (Backend Server)
  └─ React SPA                   └─ Node.js Express
  └─ Global edge network         └─ Socket.io WebSocket
  └─ Vite production build       └─ Mongoose client

                    MongoDB Atlas
                      └─ MongoDB (cloud document store)

                    Cloudinary CDN
                      └─ Room photos
```

**Scalability Notes:**
- For horizontal scaling of the backend, Socket.io requires a Redis adapter for shared pub/sub state across instances
- The current single-server deployment is sufficient for up to ~10,000 concurrent connections
- Database reads are the primary bottleneck; adding read replicas handles further scale
