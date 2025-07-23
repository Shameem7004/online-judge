const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const { DBConnection } = require("./database/db.js");
const userRoutes = require("./routes/userRoutes.js");
const problemRoutes = require('./routes/problemRoutes');

// Load environment variable
dotenv.config();

// connection to database
DBConnection();

const app = express();
const PORT = process.env.PORT || 8080;

// middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// users route
app.use('/api/users', userRoutes);
// problems route
app.use('/api/problems', problemRoutes);



// test route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Backend is working!',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});