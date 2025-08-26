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

// --- FIX: Replace the existing cors middleware with this more robust configuration ---
const allowedOrigins = [
    'https://online-judge-iota-three.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
// --- End of FIX ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// users route
app.use('/api/users', userRoutes);
// problems route
app.use('/api/problems', problemRoutes);
// submission route
app.use('/api/submissions', submissionRoutes);
// AI route
app.use('/api/ai', aiRoutes); // FIX: Removed /v1
// Contest route
app.use('/api/contests', contestRoutes); // FIX: Removed /v1
// Admin route
app.use('/api/admin', adminRoutes); // FIX: Removed /v1

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