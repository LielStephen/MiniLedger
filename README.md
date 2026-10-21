# 💎 MiniLedger

> A clean, modern full-stack monorepo application to track money lent to friends, built with early-2000s "Y2K Clean" / Frutiger Aero design aesthetics.

---

## 🌟 Overview & Highlights

- **Simple & Interview-Ready**: Clean architecture with zero unnecessary abstractions or heavy ORMs. Every SQL statement, controller, and component is readable and explainable line by line.
- **Backend**: Express + TypeScript (strict) with native PostgreSQL (`pg` driver, parameterized SQL), Zod validation, JWT authentication, sliding-window rate limiting, Multer receipt upload, and automated test coverage via Jest + Supertest.
- **Mobile**: React Native with Expo (TypeScript), React Navigation Native Stack, SecureStore token persistence, Axios interceptors, ImagePicker receipt attachments, and custom Y2K Frutiger Aero glass styling.
- **Design Aesthetic ("Y2K Clean")**: Translucent glassmorphism (`BlurView`), sky-to-lavender gradient background with subtle ambient orbs, jelly pill buttons with glossy light reflections, custom Sora typography, chrome progress bar, and coral overdue pill badges.

---

## 🛠 Tech Stack

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Node.js + TypeScript (Strict) | Strongly typed backend API |
| **Framework** | Express 4.x | Lightweight, unbloated HTTP routing |
| **Database** | PostgreSQL + `pg` (Node Postgres) | Plain SQL queries, raw connection pool, zero heavy ORMs |
| **Validation** | Zod | Phone normalization, numeric & date validation |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) | 7-day signed Bearer tokens |
| **File Storage**| Multer | Uploads receipts (max 5MB, JPG/PNG only) to `/uploads` |
| **Testing** | Jest + Supertest + `pg-mem` | Integration tests running anywhere without external dependencies |
| **Mobile** | React Native (Expo SDK 52) | Cross-platform iOS & Android mobile application |
| **Navigation**| React Navigation Native Stack | Native performant screen transitions |
| **Design** | `expo-linear-gradient`, `expo-blur` | Jelly buttons, glassmorphic cards, glowing OTP boxes |
| **Typography**| `@expo-google-fonts/sora` | Bold friendly numbers & clean labels |
| **Storage** | `expo-secure-store` | Hardware-backed encrypted JWT token persistence |
| **Infra** | Docker & Docker Compose | Containerized PostgreSQL 16 with healthchecks |

---

## 📂 Monorepo Structure

```
MiniLedger/
├── docker-compose.yml       # PostgreSQL 16 container with healthcheck & volume
├── .env.example             # Template for all environment variables
├── .gitignore               # Ignores node_modules, build outputs, uploads, secrets
├── README.md                # Project documentation & demo guide
├── backend/                 # Node.js + TypeScript Express REST API
│   ├── src/
│   │   ├── app.ts           # Express setup, helmet, cors, routes, error handling
│   │   ├── server.ts        # Server entrypoint listening on PORT
│   │   ├── config.ts        # Environment configuration
│   │   ├── db/
│   │   │   ├── index.ts     # pg Pool client and parameterized query runner
│   │   │   ├── schema.sql   # DDL for users, otps, and loans tables
│   │   │   ├── migrate.ts   # Database migration runner (`npm run migrate`)
│   │   │   └── seed.ts      # Demo seed script (`npm run seed`)
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Bearer JWT verification middleware
│   │   │   ├── rateLimit.ts    # Sliding window rate limiter (max 3 per 10 min)
│   │   │   ├── upload.ts       # Multer receipt upload configuration
│   │   │   └── errorHandler.ts # Central error handler (Zod, Multer, 404, 500)
│   │   ├── routes/
│   │   │   ├── auth.ts      # /auth/request-otp, /auth/verify-otp
│   │   │   └── loans.ts     # /loans (CRUD, repay, single-query summary)
│   │   └── validators/
│   │       ├── auth.ts      # Phone normalization (+91/E.164) & OTP schemas
│   │       └── loan.ts      # Loan creation Zod schema
│   ├── tests/
│   │   ├── auth.test.ts     # Jest tests for OTP & auth flows
│   │   ├── loans.test.ts    # Jest tests for loans CRUD, repay, and summary math
│   │   └── setupTestDb.ts   # Fast in-memory test database harness
│   └── package.json
└── mobile/                  # React Native Expo Application
    ├── App.tsx              # Font loading, SafeAreaProvider, AuthProvider
    ├── app.json             # Expo project configuration
    ├── src/
    │   ├── theme.ts         # Colors, gradients, radii, shadows, typography
    │   ├── api/
    │   │   └── client.ts    # Axios instance, SecureStore interceptor, API calls
    │   ├── context/
    │   │   └── AuthContext.tsx # Token persistence & auto-login state
    │   ├── components/
    │   │   ├── GradientBackground.tsx # Sky-to-lavender gradient with ambient orbs
    │   │   ├── GlassCard.tsx          # Frosted blur card with highlight border
    │   │   ├── GlossyButton.tsx       # Jelly button with top light reflection
    │   │   ├── Pill.tsx               # Overdue, Repaid, Pending status badges
    │   │   ├── SummaryCard.tsx        # Top stats card with chrome progress bar
    │   │   ├── LoanCard.tsx           # Individual loan item with repay button
    │   │   └── OtpInput.tsx           # 6-box OTP input with aqua focus glow
    │   ├── screens/
    │   │   ├── LoginScreen.tsx    # Phone number -> OTP verify screen
    │   │   ├── HomeScreen.tsx     # Summary card, loans list, pull-to-refresh
    │   │   └── AddEntryScreen.tsx # Loan entry form with date & image picker
    │   └── navigation/
    │       └── AppNavigator.tsx   # Native stack navigator
    └── package.json
```

---

## ⚡ Prerequisites

- **Node.js** v18+ (tested on Node.js v24)
- **npm** or **yarn**
- **Docker & Docker Compose** (for running PostgreSQL container)

---

## 🚀 Step-by-Step Run Instructions

### 1. Start PostgreSQL with Docker

From the project root:
```bash
docker compose up -d
```
*This starts PostgreSQL 16 on port 5432 with health check and persistent storage volume.*

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```
Ensure `DATABASE_URL` matches your PostgreSQL configuration:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/miniledger
JWT_SECRET=super-secret-jwt-key-miniledger-2026
BASE_URL=http://localhost:4000
```

### 3. Run Migrations & Seed Demo Data

```bash
# In /backend:
npm run migrate
npm run seed
```
The seed script inserts a demo user (`+919876543210`) with 6 sample loans (Alex Chen overdue, Priya Sharma overdue, David Miller pending, Sara Connor pending, Rohan Verma repaid, Emma Watson repaid).

### 4. Start the Backend API

```bash
npm run dev
```
The server will boot up at `http://localhost:4000`.

### 5. Configure & Start Mobile App

In a new terminal window:
```bash
cd mobile
```

#### Setting the API URL:
- **iOS Simulator / Web**: Defaults automatically to `http://localhost:4000`.
- **Android Emulator**: Defaults automatically to `http://10.0.2.2:4000`.
- **Physical Device (Expo Go)**: Set your computer's local Wi-Fi IP address in `mobile/.env`:
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.XX:4000
  ```

Start the Expo development server:
```bash
npx expo start
```
Press `w` to open in browser, `a` for Android, or `i` for iOS.

---

## 🔑 Mock OTP Authentication in Logs

To make testing and grading instantaneous without requiring paid SMS gateways:
1. When you enter a phone number in the mobile app and press **"Send OTP"**, the backend prints the OTP code directly in the terminal:
   ```text
   [MOCK OTP] +919876543210 -> 849201
   ```
2. Enter the 6 digits (`849201`) in the mobile app's 6-box OTP input.
3. The app authenticates and persists the 7-day JWT securely in `expo-secure-store`.

---

## 🧪 Running Automated Tests

Run the complete backend integration test suite:
```bash
cd backend
npm test
```
The test suite utilizes Jest, Supertest, and `pg-mem` to execute 16 integration tests in isolation:
- OTP generation and ensuring OTP is **never** exposed in the HTTP response.
- Phone number validation and normalization.
- Sliding window rate limiting (blocking > 3 OTP attempts per 10 minutes).
- OTP verification, duplicate usage prevention, and JWT issuance.
- Loan creation validation (rejecting negative/zero amounts and empty names).
- Computed `isOverdue` status calculation.
- Loan repayment flow with 404/409 error handling.
- Single-query summary metric aggregation math.

To verify TypeScript compilation with strict checking:
```bash
# In /backend:
npx tsc --noEmit

# In /mobile:
npx tsc --noEmit
```

---

## 📡 API Reference & Sample cURL Commands

### 1. Request OTP
- **Route**: `POST /auth/request-otp`
- **Body**: `{ "phone": "9876543210" }`
```bash
curl -X POST http://localhost:4000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```
*Output in backend console: `[MOCK OTP] +919876543210 -> 123456`*

### 2. Verify OTP & Receive JWT
- **Route**: `POST /auth/verify-otp`
- **Body**: `{ "phone": "+919876543210", "otp": "123456" }`
```bash
curl -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

### 3. Get Summary Metrics (Single SQL Aggregation)
- **Route**: `GET /loans/summary`
- **Headers**: `Authorization: Bearer <TOKEN>`
```bash
curl -X GET http://localhost:4000/loans/summary \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```
**Response**:
```json
{
  "totalLent": 6750.50,
  "totalRepaid": 1700.00,
  "totalPending": 5050.50,
  "overdueAmount": 3900.50,
  "overdueCount": 2
}
```

### 4. List Loans
- **Route**: `GET /loans`
- **Headers**: `Authorization: Bearer <TOKEN>`
```bash
curl -X GET http://localhost:4000/loans \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 5. Create a Loan Entry (with Optional Receipt)
- **Route**: `POST /loans`
- **Headers**: `Authorization: Bearer <TOKEN>`
```bash
# JSON request without image:
curl -X POST http://localhost:4000/loans \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"friendName": "John Doe", "amount": 2500, "dueDate": "2026-11-15"}'

# Multipart request with receipt image:
curl -X POST http://localhost:4000/loans \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "friendName=John Doe" \
  -F "amount=2500" \
  -F "dueDate=2026-11-15" \
  -F "receipt=@/path/to/receipt.jpg"
```

### 6. Mark Loan as Repaid
- **Route**: `PATCH /loans/:id/repay`
- **Headers**: `Authorization: Bearer <TOKEN>`
```bash
curl -X PATCH http://localhost:4000/loans/<LOAN_ID>/repay \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 🎨 Design Philosophy: "Y2K Clean"

The UI is inspired by early-2000s tech optimism and **Frutiger Aero / iPod-era gloss**, modernized with contemporary minimalism:
- **Palette**:
  - Sky-to-Lavender background gradient (`#EAF4FF` to `#F1EAFF`) with faint blurred floating orbs.
  - Primary Aqua (`#3AA7FF`) & Periwinkle (`#8B9CFF`).
  - Mint (`#10B981`) for repaid/positive status.
  - Coral Pink (`#FF4D6D`) for overdue urgency.
  - Deep Navy (`#12203A`) and Muted Slate (`#6B7A90`) for high contrast accessibility.
- **Glassmorphism**: Translucent frosted surfaces (`BlurView` with 60-70% opacity, 1.5px crisp white border, and soft blue shadow).
- **Jelly Buttons**: Pill-shaped buttons featuring a 48% height translucent white top highlight gradient that simulates glassy physical reflection, accompanied by smooth spring press scaling.
- **Micro-Details**: Star glyphs (`✦ ✧`) on the summary card, chrome gradient progress bar showing recovery percentage, and aqua focus glow on the 6 OTP input boxes.

---

## 🧠 Architectural Decisions & Trade-offs

1. **Plain SQL with `pg` Pool vs. Heavy ORM (Prisma/TypeORM)**:
   - *Decision*: We used raw parameterized SQL queries with the native `pg` driver.
   - *Rationale*: Eliminates migration bloat, hidden queries, and memory overhead. Allows expressing the summary metrics in a **single, lightning-fast SQL aggregation query** (`SUM(CASE WHEN ...)`), which is simple to explain line by line in an interview.
2. **Mock OTP via Server Logs**:
   - *Decision*: OTP is generated with standard cryptographic hashing, printed to `console.log("[MOCK OTP] ...")`, and **never** returned in the HTTP response.
   - *Rationale*: Keeps the authentication flow realistic and production-secure without requiring paid SMS APIs.
3. **In-Memory Sliding-Window Rate Limiting**:
   - *Decision*: Simple in-memory timestamp sliding window (max 3 requests per 10 minutes per phone).
   - *Rationale*: Avoids adding a Redis dependency while preventing spam. Easily extensible to Redis for distributed environments.
4. **JWT in SecureStore vs. AsyncStorage**:
   - *Decision*: Used `expo-secure-store` for token storage.
   - *Rationale*: `AsyncStorage` stores data in unencrypted plaintext on mobile devices. `SecureStore` encrypts secrets in the iOS Keychain and Android Keystore.
5. **No Redux**:
   - *Decision*: Used React Context (`AuthContext`) and local screen state.
   - *Rationale*: MiniLedger's state needs are straightforward. Adding Redux would add unnecessary boilerplate and cognitive overhead.

---

## 🎬 2-3 Minute Interview Demo Script

Follow these steps to demonstrate MiniLedger end-to-end:

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| **1** | Open app & enter phone `9876543210` -> tap **"Send OTP"** | Button shows loading indicator. Screen transitions to 6-box OTP input with blue info badge. |
| **2** | Check backend terminal logs | Look for `[MOCK OTP] +919876543210 -> XXXXXX`. Copy the 6 digits. |
| **3** | Type/paste OTP in the 6 boxes -> tap **"Verify & Enter"** | Boxes glow aqua on focus. JWT is saved in SecureStore, auto-navigating to **HomeScreen**. |
| **4** | Review **SummaryCard** on HomeScreen | Shows **Total Lent**, **Repaid**, **Pending**, and **Overdue** metrics with chrome progress bar and star glyphs. |
| **5** | Inspect the Loan entries list | Overdue loans (Alex Chen, Priya Sharma) are highlighted with coral tint, border, and `! OVERDUE (Xd)` badge. Repaid loans show muted checkmark. |
| **6** | Tap floating **"+"** button at bottom right | Transitions to **AddEntryScreen** with slide animation. |
| **7** | Enter friend name (e.g., "Sarah"), amount (e.g., "750"), tap preset **"+1 Week"**, optionally attach receipt image -> tap **"Save Loan Entry"** | Inline validation passes, loan is uploaded with receipt. Transitions back to HomeScreen and auto-refreshes. |
| **8** | Tap **"Mark Repaid"** on any pending loan | Native confirmation alert appears: *"Did [Friend] repay ₹X?"* Confirming updates loan with checkmark and recalculates SummaryCard totals immediately. |
| **9** | Pull down to refresh | FlatList shows smooth aqua spinner and updates instantly. |
| **10** | Tap **"Sign Out"** in top header | Confirms sign out, clears SecureStore token, and smoothly returns to LoginScreen. |
