# CodeVerse Online Judge

A full‑stack online judge platform supporting problem solving, contests, AI code review (Gemini), daily challenges, secure queued judging, and a multi‑language Dockerized compiler microservice.

---

## ✨ Core Features

### Problems & Submissions
- CRUD for problems with tags, difficulty, formats, constraints.
- Sample & hidden test cases ([`backend/models/Testcase`](backend/models/Testcase.js)).
- Streaming live judging via Server‑Sent Events (SSE) ([`streamSubmissionResults`](backend/controllers/submissionController.js)).
- Batched & queued processing using BullMQ worker ([`worker.js`](backend/worker.js)) + Redis.

### Compiler Microservice
- Isolated Docker execution for: C, C++, Java, Python, JavaScript.
- Per‑run CPU, memory, network restrictions ([`executeCode`](compiler/services/codeExecutionService.js)).
- File generation abstraction ([`generateFile`](compiler/utils/generateFile.js)).

### AI Code Review
- Gemini powered analysis endpoint ([`analyzeSubmission`](backend/controllers/aiController.js)).
- Prompt & processing service ([`getCodeAnalysis`](backend/services/geminiService.js)).
- Frontend modal with Markdown rendering (`AIFeedbackModal` component).

### Contests
- Contest model with leaderboard + registration ([`Contest`](backend/models/Contest.js)).
- Admin contest management & seeding logic ([`contestController`](backend/controllers/contestController.js)).
- Contest listing, detail, countdown, leaderboard pages.

### Daily Problem
- Daily rotation endpoint (`/problems/daily`).
- “Start Solving” on home navigates to daily problem page.

### Leaderboards & Profiles
- Global leaderboard from aggregated user points ([`getLeaderboard`](backend/controllers/userController.js)).
- Public & private profile stats (points, solved count, contests, submission stats).

### Admin Panel
- Dashboard stats ([`adminController`](backend/controllers/adminController.js)).
- Management pages for users, problems, contests, submissions.

### Security & Auth
- JWT + HTTP‑only cookie auth (`auth` middleware).
- Admin guard (`adminAuth`).
- Rate limiting on auth routes.
- Strict CORS allow‑list in `server.js`.

---

## 🏗 Architecture (High Level)

```
        +-------------+        POST /submissions        +-------------------+
User -->| Frontend UI |-------------------------------->|  API Gateway (Exp) |
        |  React/Vite |<--SSE /submissions/stream/:id---|  backend/server.js |
        +------+------+                                  +------+------------+
               |                                                 |
               | REST (/ai, /problems, /contests, /users)         |
               |                                                 v
               |                                          +-------------+
               |   Job enqueue (BullMQ)                   |  Worker     |
               +----------------------------------------->|  (Judger)   |
                                                          +------+------+
                                                                 |
                                                Fetch testcases  |
                                                                 v
                                                         +--------------+
                                                         | MongoDB      |
                                                         +--------------+
                                                                 |
                                                Run code via HTTP |
                                                                 v
                                                        +------------------+
                                                        | Compiler Service |
                                                        |  (Docker runner) |
                                                        +------------------+
```

---

## 📂 Project Structure

```bash
Online-Judge/
├── backend/
│   ├── controllers/          # API logic (users, problems, submissions, contests, AI, admin)
│   ├── routes/               # Express route modules
│   ├── models/               # Mongoose schemas (User, Problem, Contest, Submission, Testcase)
│   ├── middlewares/          # auth.js, adminAuth.js, rate limiting, etc.
│   ├── services/             # External service logic (Gemini AI, etc.)
│   ├── database/             # DB connection (db.js)
│   ├── utils/                # Queue setup, helpers
│   ├── worker.js             # BullMQ worker that judges submissions
│   ├── server.js             # Express app entry
│   ├── package.json
│   └── .env (ignored)
├── compiler/
│   ├── controllers/          # runCode controller
│   ├── routes/               # /api/run
│   ├── services/             # codeExecutionService (Docker exec logic)
│   ├── utils/                # generateFile, etc.
│   ├── codes/                # Generated source files (gitignored)
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── .env (ignored)
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API wrappers
│   │   ├── components/       # Reusable UI + feature components
│   │   ├── context/          # Auth, Notification, (add Theme later)
│   │   ├── pages/            # Route pages
│   │   ├── styles/           # Design tokens
│   │   ├── utils/            # Helpers (cn, etc.)
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env (ignored)
├── .gitignore
├── README.md
└── (optional) docker-compose.yml
```

---

## 📂 Key Directories

```
backend/
  controllers/ routes/ models/ middlewares/ services/ utils/ worker.js
compiler/
  controllers/ services/ utils/ Dockerfile
frontend/
  src/ (pages, components, api, context, styles)
```

---

## 🔄 Submission Lifecycle

1. Frontend calls `initiateSubmission` → POST `/submissions`.
2. Backend enqueues job (`submissionQueue`).
3. Worker consumes job → executes against testcases via compiler service.
4. Results appended incrementally to `Submission.testCaseResults`.
5. SSE endpoint streams progress until final verdict.
6. First AC for a problem awards points.

---

## 🤖 AI Code Review Flow

1. User opens AI modal after judging.
2. POST `/ai/:submissionId/analyze`.
3. Ownership validated.
4. Gemini prompt built in `geminiService`.
5. Markdown response rendered client-side.

> IMPORTANT: Never commit real API keys. Use `.env` (already ignored).

---

## 🗓 Daily Problem

- `GET /problems/daily` returns highlighted problem of the day.

---

## 🏆 Contest Mechanics (Baseline)

- Register: `POST /contests/:id/register`
- Leaderboard aggregated from submissions (extend with penalties/rating later).

---

## 📊 Leaderboard Scoring

Current: sum of points from first AC per problem.  
Future: rating systems (Elo/Glicko), difficulty weighting.

---

## 🔐 Security Practices

| Area      | Current                    | Suggested Next |
|-----------|----------------------------|----------------|
| Auth      | JWT (HTTP‑only cookie)     | Refresh rotation |
| RateLimit | Auth endpoints             | Adaptive global |
| Sandbox   | Docker limits + no network | seccomp, drop caps |
| Secrets   | .env                       | SSM / Vault |
| Queue     | BullMQ basic               | Retry + DLQ |
| Execution | Network disabled           | Readonly FS overlay |

> REMOVE sensitive keys / private RSA files (e.g. `compiler/keys/CodeVerse-Compiler-key.pem`). Rotate exposed credentials immediately.

---

## ⚙️ Environment Variables

Backend (`backend/.env`)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/db
PORT=4000
JWT_SECRET_KEY=change_me
FRONTEND_URL=http://localhost:5173
COMPILER_URL=http://localhost:3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GEMINI_API_KEY=your_gemini_key
ADMIN_SECRET_KEY=choose_admin_secret
```

Compiler (`compiler/.env`)
```
PORT=3000
HOST_CODE_DIR=/absolute/path/to/compiler/codes
EXECUTOR_IMAGE=codeverse-compiler:latest
```

Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000
VITE_COMPILER_API_URL=http://localhost:3000/api
```

---

## 🚀 Local Development

```bash
# Backend
cd backend && npm install && npm run dev

# Worker (optional separate)
npm run worker:dev

# Compiler
cd compiler && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🐳 Docker (Compiler Example)

```bash
cd compiler
docker build -t codeverse-compiler .
docker run --rm -p 3000:3000 -v "$(pwd)/codes:/app/codes" codeverse-compiler
```

---

## 📡 Important Endpoints

| Purpose            | Method | Path                          |
|--------------------|--------|-------------------------------|
| Create submission  | POST   | /submissions                  |
| Stream results     | GET    | /submissions/stream/:id       |
| AI analysis        | POST   | /ai/:submissionId/analyze     |
| Daily problem      | GET    | /problems/daily               |
| Contests list      | GET    | /contests                     |
| Contest leaderboard| GET    | /contests/:id/leaderboard     |

---

## 🧩 Frontend Highlights

- Context-based auth & notifications.
- Modular admin layout.
- Live judge streaming via SSE.
- AI feedback modal with Markdown rendering.

---

## 📬 Queue & Worker

- Queue: `utils/submissionQueue.js`
- Worker: `worker.js`
- Horizontal scaling: spawn more workers (Redis handles distribution).

---

## 🛠 Backend Scripts

| Script               | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start server (nodemon)                   |
| `npm run worker:dev` | Start judge worker                       |
| `npm start`          | Run server + worker (concurrently)       |
| `npm run start:server` | Server only                           |
| `npm run start:worker` | Worker only                           |

---

## 🧪 Extensibility Ideas

- Memory / CPU reporting.
- Contest rating system.
- Editorials & discussions.
- WebSocket real-time channel.
- Plagiarism detection.
- Per-problem code templates.

---

## 🔄 Roadmap (Suggested)

1. Harden sandbox (seccomp/AppArmor).
2. Add runtime caching / warm pools.
3. Virtual contests & upsolve tracking.
4. Advanced leaderboard filters.
5. AI hint mode (partial guidance).
6. Tag-based recommendations.

---

## ⚠️ Action Required (Security)

```bash
# Remove leaked private key from history (after rotating it)
git rm --cached compiler/keys/CodeVerse-Compiler-key.pem
echo "compiler/keys/" >> .gitignore
git commit -m "chore: remove leaked key"
# Then rewrite history & force-push (filter-repo / BFG) if already pushed
```

Rotate all exposed secrets (DB, JWT, Gemini, Redis, etc.).

---

## 📄 License

Add an OSS license (MIT recommended) if making public.

---

## 🙌 Contributions

PRs and issues welcome (architecture, tests, sandbox hardening).

---

Happy Coding!