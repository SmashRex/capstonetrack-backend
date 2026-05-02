# CapstoneTrack Backend API

**Phase 1: Authentication Foundation** | Current Development

---

## Quick Summary

**CapstoneTrack** solves a critical problem: **Fair individual grading in group capstone projects.**

When students work in groups, traditional grading gives everyone the same score regardless of individual effort. CapstoneTrack tracks every student's contributions automatically (GitHub commits, pull requests, coding hours, milestones) and calculates fair individual scores using a transparent weighted formula.

> **Full Specification**: [PRODUCT_SPEC.md](../PRODUCT_SPEC.md) — Complete feature list, MVP scope, V2 & V3 roadmap, database schema, build guide

---

## 📋 What CapstoneTrack Does

CapstoneTrack replaces manual capstone project management with an automated, fair, and transparent system:

- **Automated Team Assignment**: Uploads CSV of students → system filters (80%+ exam score) → shuffles balanced cross-track groups → auto-creates GitHub repos
- **Contribution Tracking**: Pulls real-time data from GitHub (commits, PRs) and WakaTime (coding hours) per student
- **Fair Grading**: Teachers grade track-specific rubrics in blind mode; platform calculates weighted final scores using evidence sources appropriate to each track
- **Background Checks**: Flags inactivity, suspicious commits, and low-quality commit messages
- **Report Generation**: Auto-generates PDF report cards with contribution stats, rubric scores, and final grades
- **Milestone Management**: Tracks project phases with automated alerts when groups fall behind

---

## 📚 Table of Contents

- [Current Phase: MVP](#current-phase-mvp)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Development Roadmap](#development-roadmap)
- [Testing the API](#testing-the-api)
- [Development Notes](#development-notes)

---

## ⚙️ Current Phase: MVP

CapstoneTrack is being built in **8 sequential phases**. This repository is currently in **Phase 1**.

### Phase 1 — Authentication Foundation ✅ In Progress

Core authentication and role-based access control layer:

- ✅ Admin and teacher login with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Protected routes by role
- ✅ User schema with roles (admin, teacher, student, examiner)
- 🔄 Basic dashboard routes (empty, ready for Phase 2)

**What's Next**: Phase 2 will add student CSV upload and eligibility filtering.

### Phase 2 — Student Data Ingestion (Next)
- CSV upload endpoint with validation
- 80%+ exam score filtering
- Dashboard display of qualified students

### Phase 3 — Group Shuffling
- Balanced cross-track group algorithm
- Database schema for teams and team members

### Phase 4 — GitHub Integration
- Auto-create private repos per group
- Auto-add students as collaborators
- Auto-generate README with project brief

### Phase 5 — Email System
- Personalised email per student
- Email template with project details
- Mailtrap integration for safe testing

### Phase 6 — Contribution Tracking Dashboard
- Pull GitHub data (commits, PRs, issues)
- Pull WakaTime data (coding hours, languages)
- Teacher dashboard with contribution stats
- Group health score (green/yellow/red)

### Phase 7 — Grading System
- Track-specific rubric creation
- Blind grading mode for teachers
- Automated score aggregation
- PDF report card generation

### Phase 8 — Polish & Deploy
- UI refinements and error handling
- Documentation and demo video
- Deploy to production (Vercel, Render, Supabase)

See the [full product specification](./PRODUCT_SPEC.md) for V2 and V3 features (student dashboards, leaderboards, peer reviews, additional tracks, etc.).

---

## 🛠️ Tech Stack

### Current (Phase 1)
- **Runtime**: Node.js v24.14.0
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB + Mongoose 9.6.1 (Phase 1 prototype)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Environment**: dotenv 17.4.2
- **Development**: nodemon 3.1.14

### Final Stack (Phases 2+)
- **Database**: PostgreSQL with Prisma ORM (production)
- **Caching**: Redis (optional, for leaderboards and analytics)
- **Email**: SendGrid / Mailgun / AWS SES (production)
- **External APIs**: GitHub API, WakaTime API, Figma API (V2)
- **Containerisation**: Docker
- **Hosting**: Vercel (frontend), Render/Railway (backend), Supabase (database)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app setup, routes, middleware
│   ├── config/
│   │   └── db.js                # Database connection
│   ├── controllers/
│   │   ├── authControllers.js   # Auth: register, login
│   │   ├── adminControllers.js  # Admin features (Phase 2+)
│   │   ├── teacherControllers.js # Teacher features (Phase 6+)
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddlewares.js   # JWT verification
│   │   ├── roleMiddlewares.js   # Role-based authorization
│   │   └── ...
│   ├── models/
│   │   ├── user.js              # User schema
│   │   ├── team.js              # Team schema (Phase 3)
│   │   ├── project.js           # Project schema (Phase 4)
│   │   └── ...
│   └── routes/
│       ├── authRoutes.js        # Authentication endpoints
│       ├── adminRoutes.js       # Admin endpoints (Phase 2+)
│       ├── teacherRoutes.js     # Teacher endpoints (Phase 6+)
│       └── ...
├── server.js                     # Server entry point
├── package.json
├── PRODUCT_SPEC.md              # Full product planning document
└── .env                          # Environment variables (not in git)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas connection string)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SmashRex/capstonetrack-backend.git
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the `backend/` directory
   - See [Environment Variables](#environment-variables) section below

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The API will be running at `http://localhost:5000`

### Production Build

```bash
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Port
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/capstonetrack
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capstonetrack?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Security Note**: Never commit `.env` to version control. Use environment-specific secrets in production.

**Database Migration Note**: Phase 1 uses MongoDB for rapid prototyping. Phases 2+ will migrate to PostgreSQL + Prisma for production.

---

## 📡 Current API Endpoints (Phase 1)

### Health Check

**GET** `/api/health`

Returns server status.

```json
{
  "status": "OK",
  "message": "CapstoneTrack API is running",
  "timestamp": "2026-05-02T09:53:00.272Z"
}
```

---

### User Registration

**POST** `/api/auth/register`

Register an admin or teacher account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Valid Roles** (Phase 1): `admin`, `teacher`  
**Valid Roles** (Phase 2+): `admin`, `teacher`, `student`, `examiner`

**Validation Rules**:
- All fields required
- Email must contain `@`
- Password minimum 8 characters
- Email must be unique

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "userId": "69f5c9826aa4dd224ed5aff7",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### User Login

**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "message": "User Logged in Successfully",
  "userId": "69f5c9826aa4dd224ed5aff7",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Upcoming Endpoints (Phase 2+)

These endpoints will be added in future phases:

```
POST   /api/admin/cohorts                   # Create a new cohort
POST   /api/admin/students/upload           # Upload student CSV (Phase 2)
POST   /api/admin/groups/generate           # Trigger group shuffling (Phase 3)
POST   /api/admin/repos/create              # Create GitHub repos (Phase 4)
POST   /api/students/email/send             # Send personalised emails (Phase 5)
GET    /api/teacher/contributions/{track}   # View contribution stats (Phase 6)
POST   /api/teacher/grades/submit           # Submit rubric grades (Phase 7)
GET    /api/reports/student/{id}            # Generate report card (Phase 8)
```

---
## 📦 Installation & Setup

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SmashRex/capstonetrack-backend.git
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start development server
npm run dev

# 5. Server runs on http://localhost:5000
```

### Production Build

```bash
npm start
```

---
## 🔑 Authentication & Authorization

### JWT Token Structure

All authenticated requests must include:

```
Authorization: Bearer <token>
```

Token contains:
- `id`: User's database ID
- `role`: User's role (admin, teacher, student, examiner)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (7 days by default)

### Role-Based Access Control

| Role | Can Access | Cannot Access |
|------|-----------|--------------|
| **Admin** | CSV upload, group creation, GitHub config, all dashboards, audit logs, rubric management | Cannot be locked out by blind grading |
| **Teacher** | Their assigned track students only, contribution data, rubric grading, annotations | Student removal, GitHub repos, exam data |
| **Student** (V2+) | Own dashboard, leaderboard, standup logs, peer reviews | Other students' scores, team changes, GitHub settings |
| **Examiner** | Read-only view of all groups, scores, and flags | Modify anything, access student data |

---

## 🧪 Testing the API

### Using PowerShell (Windows)

**Health Check**:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health -Method GET | Select-Object -ExpandProperty Content
```

**Register**:
```powershell
$body = @{
    name = "Admin User"
    email = "admin@bootcamp.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

**Login**:
```powershell
$body = @{
    email = "admin@bootcamp.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

### Using cURL

**Health Check**:
```bash
curl http://localhost:5000/api/health
```

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@bootcamp.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bootcamp.com",
    "password": "password123"
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Body tab → Raw → JSON
4. Paste request JSON
5. Click Send

---

## � Development Roadmap

### Phase 1 ✅ In Progress — Authentication Foundation
- Admin and teacher login
- JWT token generation and verification
- Password hashing with bcryptjs
- Protected routes by role
- User database schema

**Estimated Completion**: Week 1

---

### Phase 2 → Student Data Ingestion
- CSV upload endpoint (Multer + csv-parse)
- 80%+ exam score eligibility filter
- Admin dashboard for qualified students
- Batch student creation from CSV

**Estimated Start**: Week 2

---

### Phase 3 → Group Shuffling Algorithm
- Balanced cross-track group generation
- Team and team_members database tables
- Group visualization on admin dashboard
- Shuffle configuration (group size, track balance)

**Estimated Start**: Week 3

---

### Phase 4 → GitHub Integration
- GitHub API OAuth setup
- Auto-create private repos per group
- Auto-add students as collaborators
- Auto-generate README with project brief
- Test GitHub organisation setup

**Estimated Start**: Week 4

---

### Phase 5 → Email System
- Mailtrap integration for email testing
- Personalised email template
- Email sending on group creation
- Email log tracking

**Estimated Start**: Week 5

---

### Phase 6 → Contribution Tracking Dashboard
- GitHub API data polling (commits, PRs, branches)
- WakaTime API integration (coding hours, languages)
- Teacher dashboard with contribution stats
- Group health score calculation (green/yellow/red)
- Background check flags (inactivity, suspicious commits)

**Estimated Start**: Week 6

---

### Phase 7 → Grading System
- Admin rubric builder
- Teacher grading checklist
- Blind grading mode (hides student names)
- Automated score aggregation
- Weighted formula calculation per track
- PDF report card generation

**Estimated Start**: Week 7

---

### Phase 8 → Polish & Deploy
- UI refinements and consistent styling
- Error handling and loading states
- Comprehensive documentation
- Demo video recording
- Deploy frontend (Vercel), backend (Render), database (Supabase)

**Estimated Start**: Week 8

---

## 💡 Development Notes

### Key Architecture Decisions

1. **Controller Pattern**: Controllers handle both request processing and response sending (industry standard)
   - Controllers receive `req` and `res` directly
   - Routes are clean one-liners: `router.post('/login', loginUser)`
   - Eliminates need for route-level response handling

2. **Password Security**:
   - Passwords are hashed with bcryptjs (salt rounds: 10)
   - Plain passwords are never stored in database
   - Plain passwords are never returned in responses

3. **JWT Strategy**:
   - Stateless authentication (no session storage needed)
   - Token expires in 7 days by default
   - Can be customized via `JWT_EXPIRES_IN` environment variable

4. **Modular by Track**: The grading system is designed to be configurable per track
   - Backend track uses GitHub commits + WakaTime hours
   - UI/UX track will use Figma API + design rubric
   - Each track has its own weighted formula
   - New tracks can be added without core changes

5. **Database Migration Path**:
   - Phase 1: MongoDB for rapid prototyping
   - Phases 2+: PostgreSQL + Prisma for production
   - Designed for easy migration (same data model concepts)

### Hot Reload in Development

The development server uses nodemon, which automatically restarts when you modify files. Changes are reflected instantly without manual restart.

### Security Considerations

- `.env` file never committed to git
- JWT secret should be strong and unique per environment
- Passwords hashed before storage
- Environment-specific configuration (dev vs production secrets)
- Role-based route protection on all sensitive endpoints

---

## 🎯 Key Features by Track (Future)

The platform supports multiple student tracks, each with unique grading criteria:

| Track | Primary Evidence | Grading Focus |
|-------|------------------|---------------|
| **Backend** | GitHub commits + WakaTime | API design, database schema, authentication, performance |
| **Frontend** | GitHub commits + WakaTime | UI quality, responsiveness, design accuracy, integration |
| **UI/UX** (V2) | Figma API + design rubric | Design consistency, user flow, accessibility |
| **Cybersecurity** (V2) | Vulnerability reports + logs | Threat modelling, pen testing, security hardening |
| **Project Management** (V2) | Milestones + standup logs | Milestone adherence, documentation, team coordination |
| **Data Analysis** (V2) | Analytical outputs + rubric | Data handling, insight accuracy, visualisation quality |
| **AI & Automation** (V3) | Integration accuracy + model performance | Feature quality, efficiency gains, model accuracy |

---

## 📚 Resources

- **Full Product Specification**: See [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) for complete feature list, MVP scope, and V2 & V3 roadmap
- **GitHub Repository**: [github.com/SmashRex/capstonetrack-backend](https://github.com/SmashRex/capstonetrack-backend)
- **Issue Tracker**: Report bugs and request features via GitHub Issues

---

## 📄 License

ISC

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all tests pass and code follows the project style before submitting.

---

**Built to demonstrate that one person can architect and build a complex, production-grade system.**

**CapstoneTrack is a full system design portfolio piece that demonstrates:**
- Full-stack engineering (frontend, backend, database, DevOps)
- API design and integration (GitHub, WakaTime, Email services)
- Database modeling (relational schema for complex business logic)
- Authentication and authorization systems
- Automated business logic and reporting
- Real-world problem solving (fairness in grading, contribution tracking, team balance)

**That is worth more than any certificate.**
