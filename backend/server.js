const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");


dotenv.config();

const { DBConnection } = require("./database/db.js");
const userRoutes = require("./routes/userRoutes.js");
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes.js');
const testCaseRoutes = require('./routes/testCaseRoutes.js');
const aiRoutes = require('./routes/aiRoutes');
const contestRoutes = require('./routes/contestRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes

// connection to database
DBConnection();

const app = express();
const PORT = process.env.PORT || 8080;

// middleware
const RAW_ALLOWED = [
  'https://www.codeversee.in',
  'https://codeversee.in',
  'https://algo-codeverse.vercel.app',
  'https://online-judge-g224cul22-md-shameem-alams-projects.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

// A more robust function to check origins
function isAllowedOrigin(origin) {
  const normalized = origin.endsWith('/') ? origin.slice(0, -1) : origin;

  // Check against the explicit list first
  if (RAW_ALLOWED.includes(normalized)) {
    return true;
  }

  // Allow any subdomain of vercel.app (for future previews)
  if (normalized.endsWith('.vercel.app')) {
    return true;
  }

  return false;
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser tools
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// users route
app.use('/users', userRoutes);
// problems route
app.use('/problems', problemRoutes);
// submission route
app.use('/submissions', submissionRoutes);
// AI route
app.use('/ai', aiRoutes); // FIX: Removed /v1
// Contest route
app.use('/contests', contestRoutes); // FIX: Removed /v1
// Admin route
app.use('/admin', adminRoutes); // FIX: Removed /v1

// test route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Backend is working!',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// Add this route for SSE connection keepalive
app.get('/api/ping', (req, res) => {
    res.status(200).json({ timestamp: Date.now() });
});


// Error Handling Middlewares
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});