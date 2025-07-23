# Online Judge

A full‑stack web application for coding problem management, submissions, and user authentication.

---

## 📂 Project Structure

Online-Judge/
├── backend/
│ ├── controllers/ # API logic (problems, users, submissions, etc.)
│ ├── routes/ # Express API routes
│ ├── models/ # Mongoose database schemas
│ ├── middlewares/ # Custom Express middlewares (auth, etc.)
│ ├── database/ # Database connection setup
│ ├── docker/ # Docker-related files
│ ├── server.js # Main backend server entry
│ └── package.json # Backend dependencies
├── frontend/
│ ├── src/ # React source code
│ ├── public/ # Static assets
│ ├── index.html # Main HTML file
│ ├── package.json # Frontend dependencies
│ ├── vite.config.js # Vite configuration
│ └── README.md # Frontend-specific info
├── .gitignore # Git ignore rules
└── README.md # Project documentation


---

## ✨ Features

### 🔧 Backend (Node.js, Express, MongoDB)
- RESTful API for problems, users, submissions, and test cases
- Authentication middleware
- Problem creation, listing, and retrieval
- Mongoose models for structured data

### 🎨 Frontend (React, Vite, Tailwind CSS)
- User authentication (login/register)
- Problem listing and details
- Modern UI with reusable components

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

---

### ⚙️ Backend Setup

```bash
cd backend
npm install
# Configure your environment variables in .env
npm start
```
---
### ⚙️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
--- 
### Environment Variables
- Create a .env file in the backend folder with your MongoDB URI and other secrets.