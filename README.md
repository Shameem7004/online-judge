# Online Judge

A full‑stack web application for coding problem management, submissions, and user authentication.

---

## 📂 Project Structure
```bash
Online-Judge/
├── backend/
│ ├── controllers/      # API logic (problems, users, submissions, etc.)
│ ├── routes/           # Express API routes
│ ├── models/           # Mongoose database schemas
│ ├── middlewares/      # Custom Express middlewares (auth, etc.)
│ ├── database/         # Database connection setup
│ ├── utils/            # Utility modules (submission queue, etc.)
│ ├── worker.js         # Judging worker (BullMQ + Redis)
│ ├── Dockerfile        # Backend Dockerfile
│ ├── .dockerignore     # Backend Docker ignore rules
│ ├── server.js         # Main backend server entry
│ └── package.json      # Backend dependencies
├── compiler/
│ ├── controllers/      # Compiler microservice controllers
│ ├── routes/           # Compiler microservice routes
│ ├── services/         # Code execution logic
│ ├── utils/            # Utility modules (file generation, etc.)
│ ├── Dockerfile        # Compiler Dockerfile
│ ├── .dockerignore     # Compiler Docker ignore rules
│ ├── index.js          # Compiler service entry
│ └── package.json      # Compiler dependencies
├── frontend/
│ ├── src/              # React source code
│ ├── public/           # Static assets
│ ├── index.html        # Main HTML file
│ ├── package.json      # Frontend dependencies
│ ├── vite.config.js    # Vite configuration
│ └── README.md         # Frontend-specific info
├── docker-compose.yml  # Multi-service orchestration (optional for local/AWS)
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

---

## ✨ Features

### 🔧 Backend (Node.js, Express, MongoDB, Redis)
- RESTful API for problems, users, submissions, contests, and test cases
- Authentication middleware (JWT, cookies)
- Problem creation, listing, and retrieval
- Mongoose models for structured data
- Submission queue using BullMQ and Redis for scalable judging
- Admin panel routes for management
- AI feedback integration (Gemini API)

### 🎨 Frontend (React, Vite, Tailwind CSS)
- User authentication (login/register)
- Problem listing, details, and submission
- Contest management and leaderboards
- Modern UI with reusable components
- Submission history and AI-powered code feedback

### ⚙️ Compiler Microservice (Node.js, Docker)
- Secure code execution for C++, C, Python, Java, JavaScript
- Docker-based isolation for running user code
- REST API for backend integration

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (local or cloud)
- **Redis** (local or cloud, for submission queue)
- **npm** or **yarn**
- **Docker** (for compiler microservice and containerization)

---

### ⚙️ Backend Setup

```bash
cd backend
npm install
# Configure your environment variables in .env
npm start
```

### ⚙️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### ⚙️ Compiler Service Setup

```bash
cd compiler
npm install
npm run dev
```

### ⚙️ Docker Compose (optional, for local multi-service orchestration)

```bash
docker-compose up --build
```

---

### Environment Variables

- Create a `.env` file in the backend and compiler folders with your MongoDB URI, Redis config, JWT secret, frontend URL, compiler API URL, and any other secrets.

---

## 🐳 Dockerization

- Backend and compiler services have their own Dockerfiles.
- You can build and run each service individually, or use `docker-compose.yml` for orchestration.

---

## 📝 Notes

- For deployment, you can host backend (Render/AWS) and compiler (AWS EC2/ECS) separately. Update `COMPILER_URL` in backend `.env` to point to your compiler service.
- For local development, use Docker Compose for easy setup.

---