const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const codeRoutes = require('./routes/codeRoutes');

const app = express();

dotenv.config();

const allowedOrigins = [
  'https://www.codeversee.in',
  'https://codeversee.in',
  'https://algo-codeverse.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', codeRoutes);



// Default Route 
app.get('/', (req,res) => {
    res.send(`<h1>HomePage</h1>`)
});


// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Compiler service running on port ${PORT}`);
});